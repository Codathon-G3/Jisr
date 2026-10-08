"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ar from "../i18n/ar.json";
import templates from "../../safety/plain-templates.json";
import supportCard from "../../safety/support-card.json";
import statedLimits from "../../safety/stated-limits.json";
import { checkLocalCrisis } from "../services/crisisCheck";
import { sanitizePii } from "../services/piiSanitizer";

const toneOrder = ["gentle", "direct", "formal"];

// The live API; set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000) for backend development.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://jisr-api.onrender.com").replace(/\/+$/, "");
// The free Render instance can take about a minute to wake up.
const DRAFTS_TIMEOUT_MS = 60000;

/*
  Guardian, model layer: /api/check-risk before any drafting, with identifiers
  removed. Returns true on a risk flag; false if the check passed or could not
  run (the on-device phrase check has already passed, and /api/generate-drafts
  checks again on servers that have the gate).
*/
async function fetchRisk(text, chips) {
  if (!text.trim()) {
    return false;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), DRAFTS_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/check-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sanitizePii(text).sanitisedText,
        chips,
        language: "ar",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.riskDetected === true;
  } catch (error) {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/*
  Drafts come from /api/generate-drafts, which also runs the Guardian risk check
  before any drafting. Only identifier-free text is sent.
  Returns { risk: true } on a risk flag, the AI drafts, or null so the caller
  falls back to the plain templates.
*/
async function fetchDrafts(text, chips, recipient) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), DRAFTS_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/generate-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sanitizePii(text).sanitisedText,
        chips,
        recipient,
        language: "ar",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.riskDetected === true) {
      return { risk: true };
    }

    if (!Array.isArray(data.drafts) || data.drafts.length !== 3) {
      return null;
    }

    const byTone = {};
    data.drafts.forEach((draft) => {
      byTone[draft.tone] = draft.text;
    });

    return {
      risk: false,
      drafts: byTone,
      source: data.usedFallbackTemplate ? "template" : "ai",
    };
  } catch (error) {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export default function Home() {
  const [screen, setScreen] = useState("intro");
  const [introLeaving, setIntroLeaving] = useState(false);

  const introFinishedRef = useRef(false);

  const [selectedChips, setSelectedChips] = useState([]);
  const [text, setText] = useState("");
  const [recipient, setRecipient] = useState("");

  const [showTrigger, setShowTrigger] = useState(false);
  const [dismissedKey, setDismissedKey] = useState("");

  const [showSupport, setShowSupport] = useState(false);
  const [supportIsCrisis, setSupportIsCrisis] = useState(false);
  // The text the user chose to continue with after the support card
  const [acknowledgedText, setAcknowledgedText] = useState(null);

  const [selectedTone, setSelectedTone] = useState("");
  const [editableDraft, setEditableDraft] = useState("");
  // AI drafts per tone, and where the drafts on screen came from
  const [aiDrafts, setAiDrafts] = useState({});
  const [draftSource, setDraftSource] = useState("template");
  const [continuedAfterSupport, setContinuedAfterSupport] = useState(false);
  const [busy, setBusy] = useState(false);
  // The model could not be reached, so the drafts are plain templates
  const usedFallback = draftSource === "template" && !continuedAfterSupport;

  const [copied, setCopied] = useState(false);

  // Guardian: on-device crisis phrase check, same list and rules as the mobile app
  const textRisk = useMemo(() => checkLocalCrisis(text).riskDetected, [text]);
  const crisisAcknowledged = acknowledgedText !== null && acknowledgedText === text;

  // What would leave the device for drafting, shown before anything is sent
  const outbound = useMemo(() => sanitizePii(text), [text]);

  const chipIds = Object.keys(ar.chips || {});
  const recipientIds = Object.keys(ar.recipients || {});

  /*
    Splash automatically enters the app after a few seconds.
    If the support card is open, we pause the automatic transition.
  */
  useEffect(() => {
    if (screen !== "intro" || showSupport) {
      return;
    }

    const timer = window.setTimeout(() => {
      enterApp();
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [screen, showSupport]);

  function enterApp() {
    if (introFinishedRef.current) {
      return;
    }

    introFinishedRef.current = true;
    setIntroLeaving(true);

    window.setTimeout(() => {
      setScreen("form");
      setIntroLeaving(false);
    }, 650);
  }

  // Live on-device Guardian check with 700ms debounce. Opens the crisis card
  // (with "continue to my note"), unless the user already chose to continue
  // with this exact text.
  useEffect(() => {
    if (!text || text.trim().length === 0) return;
    const timer = window.setTimeout(() => {
      const risk = checkLocalCrisis(text);
      if (risk?.riskDetected && acknowledgedText !== text) {
        openSupport(true);
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [text, acknowledgedText]);

  const selectedTopic = useMemo(() => {
    return selectedChips
      .map((id) => ar.chips?.[id])
      .filter(Boolean)
      .join("، ");
  }, [selectedChips]);

  const currentSelectionKey = useMemo(() => {
    return [...selectedChips].sort().join("|");
  }, [selectedChips]);

  const verifiedContacts = Array.isArray(supportCard.contacts)
    ? supportCard.contacts.filter(
        (contact) => contact.verified === true
      )
    : [];

  function toggleChip(id) {
    setSelectedChips((current) =>
      current.includes(id)
        ? current.filter((chip) => chip !== id)
        : [...current, id]
    );
  }

  function openSupport(isCrisis) {
    setShowTrigger(false);
    setSupportIsCrisis(isCrisis);
    setShowSupport(true);
  }

  function closeSupport() {
    setShowSupport(false);
    setSupportIsCrisis(false);
  }

  function handleContinue() {
    if (selectedChips.length === 0 || !recipient) {
      return;
    }

    // A crisis phrase shows the support card instead of drafting. If the user
    // already chose to continue, they get plain templates only.
    if (crisisAcknowledged) {
      continueWithTemplates();
      return;
    }
    if (textRisk) {
      openSupport(true);
      return;
    }

    /*
      If the user previously dismissed the invitation for
      the same topics, don't show the same invitation again.
      Their click now acts as an explicit drafting action.
    */
    if (currentSelectionKey === dismissedKey) {
      handleStartDrafting();
      return;
    }

    setShowTrigger(true);
  }

  function handleNotNow() {
    setDismissedKey(currentSelectionKey);
    setShowTrigger(false);
  }

  function createFallbackDraft(tone) {
    const template = templates?.[tone]?.[recipient];

    if (!template) {
      return "";
    }

    const labels = templates.topic_labels || {};
    const topic =
      selectedChips
        .map((id) => labels[id] || ar.chips?.[id])
        .filter(Boolean)
        .join(" و ") ||
      labels.other ||
      ar.chips?.other ||
      "";

    return template.replaceAll("{topic}", topic).replaceAll("[topic]", topic);
  }

  function chooseTone(tone, drafts = aiDrafts) {
    setSelectedTone(tone);
    setEditableDraft(drafts[tone] || createFallbackDraft(tone));
  }

  function showDrafts(drafts, source) {
    setAiDrafts(drafts);
    setDraftSource(source);
    chooseTone("gentle", drafts);
    setScreen("drafts");
  }

  // After the support card the user may still write to someone they trust.
  // Plain templates only: the flagged text is never sent for drafting.
  function continueWithTemplates() {
    setContinuedAfterSupport(true);
    showDrafts({}, "template");
  }

  function handleContinueAfterSupport() {
    setAcknowledgedText(text);
    closeSupport();
    if (screen !== "drafts") {
      continueWithTemplates();
    }
  }

  async function handleStartDrafting() {
    if (busy) {
      return;
    }

    setShowTrigger(false);

    if (textRisk && !crisisAcknowledged) {
      openSupport(true);
      return;
    }

    setContinuedAfterSupport(false);
    setBusy(true);
    setScreen("drafts");
    setSelectedTone("");
    setEditableDraft("");

    // Risk check first, then drafting (which checks again on the server).
    // Both requests carry only identifier-free text.
    const risky = await fetchRisk(text, selectedChips);
    const result = risky ? { risk: true } : await fetchDrafts(text, selectedChips, recipient);

    setBusy(false);

    if (result && result.risk) {
      setScreen("form");
      openSupport(true);
      return;
    }

    if (result) {
      showDrafts(result.drafts, result.source);
    } else {
      showDrafts({}, "template");
    }
  }

  async function handleCopy() {
    if (!editableDraft) {
      return;
    }

    try {
      await navigator.clipboard.writeText(editableDraft);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function handleShare() {
    if (!editableDraft) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: ar.app_name,
          text: editableDraft,
        });

        setScreen("ready");
      } else {
        await navigator.clipboard.writeText(editableDraft);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.log("Share cancelled or unavailable.");
    }
  }

  function goBackToForm() {
    setScreen("form");
    setSelectedTone("");
    setEditableDraft("");
    setAiDrafts({});
  }

  return (
    <main
      className={
        screen === "intro"
          ? "page introMode"
          : "page"
      }
    >
      {/* ===================================
          PERSISTENT HUMAN ROUTE
      =================================== */}

      <button
        type="button"
        className={
          screen === "intro"
            ? "humanRouteButton introHumanRoute"
            : "humanRouteButton"
        }
        onClick={() => openSupport(textRisk && !crisisAcknowledged)}
      >
        {ar.triggers?.persistent_human_route}
      </button>

      {/* ===================================
          SPLASH / INTRO
      =================================== */}

      {screen === "intro" && (
        <section
          className={
            introLeaving
              ? "introScreen introLeaving"
              : "introScreen"
          }
        >
          <div className="introArtwork" />

          <div className="introBottomShade" />

          <button
            type="button"
            className="introStartButton"
            onClick={enterApp}
          >
            ابدأ
          </button>
        </section>
      )}

      {/* ===================================
          APPLICATION
      =================================== */}

      {screen !== "intro" && (
        <section className="appCard">
          {/* =================================
              HOME / CAPTURE
          ================================= */}

          {screen === "form" && (
            <div className="screenPanel">
              <div className="brand">
                <div className="miniBridgeMark">
                  <img src="/brand/jisr-logo.png" alt="جسر" />
                </div>

                <h1>{ar.app_name}</h1>

                <p>{ar.tagline}</p>
              </div>

              <div className="section">
                <h2>
                  شن أكثر حاجة شاغلة بالك هالفترة؟
                </h2>

                <p className="hint">
                  تقدر تختار أكثر من موضوع.
                </p>

                <div className="chips">
                  {chipIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={
                        selectedChips.includes(id)
                          ? "chip selected"
                          : "chip"
                      }
                      onClick={() => toggleChip(id)}
                    >
                      {ar.chips[id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section">
                <label htmlFor="message">
                  {ar.placeholders?.user_input}
                </label>

                <textarea
                  id="message"
                  rows="4"
                  value={text}
                  onChange={(event) =>
                    setText(event.target.value)
                  }
                  placeholder={ar.placeholders?.user_input}
                />

                {/* Guardian: a crisis phrase routes to the support card, not to drafting */}
                {textRisk && (
                  <p className="hint">
                    {supportCard.title_ar}
                  </p>
                )}

                {/* What would leave the device, shown before anything is sent */}
                {!textRisk && text.trim() !== "" && (
                  <div className="disclosureBox">
                    <strong>
                      {ar.trust?.outbound_preview_title}
                    </strong>

                    <p>
                      {ar.trust?.outbound_preview_desc}
                    </p>

                    <p>
                      {outbound.sanitisedText}
                    </p>

                    {outbound.identifiersRemoved.length === 0 && (
                      <p>
                        {ar.trust?.outbound_clean}
                      </p>
                    )}

                    <p>
                      {ar.trust?.outbound_server_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="section">
                <h2>
                  {ar.placeholders?.search_recipient}
                </h2>

                <div className="recipients">
                  {recipientIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={
                        recipient === id
                          ? "recipient selected"
                          : "recipient"
                      }
                      onClick={() => setRecipient(id)}
                    >
                      {ar.recipients[id]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="continueButton"
                disabled={
                  selectedChips.length === 0 ||
                  recipient === "" ||
                  busy
                }
                onClick={handleContinue}
              >
                {busy ? "..." : ar.buttons?.start_drafting}
              </button>

              <p className="limits">
                {statedLimits.ar}
              </p>
            </div>
          )}

          {/* =================================
              DRAFTS
          ================================= */}

          {screen === "drafts" && (
            <div className="screenPanel draftScreen">
              <div className="draftHeader">
                <button
                  type="button"
                  className="smallBackButton"
                  onClick={goBackToForm}
                >
                  ←
                </button>

                <div>
                  <span className="aiBadge">
                    {draftSource === "ai"
                      ? ar.disclosure?.badge
                      : ar.disclosure?.template_badge}
                  </span>

                  <h2>
                    اختر الصياغة اللي تريحك
                  </h2>
                </div>
              </div>

              <p className="hint">
                {busy
                  ? "نجهّز ثلاث صياغات من كلامك. أول طلب بعد خمول السيرفر قد يأخذ نحو دقيقة."
                  : "اختار الأسلوب الأقرب ليك، وبعدها تقدر تعدّل أي كلمة قبل المشاركة."}
              </p>

              {usedFallback && !busy && (
                <p className="hint">
                  تعذّر وصول النموذج، فهذه قوالب جاهزة يمكنك تعديلها.
                </p>
              )}

              <div className="toneButtons">
                {toneOrder.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    className={
                      selectedTone === tone
                        ? "toneButton selected"
                        : "toneButton"
                    }
                    onClick={() => chooseTone(tone)}
                    disabled={busy}
                  >
                    <strong>
                      {ar.tones?.[tone]?.label}
                    </strong>

                    <small className="toneDescription">
                      {ar.tones?.[tone]?.description}
                    </small>
                  </button>
                ))}
              </div>

              {selectedTone && (
                <div className="editorSection">
                  <textarea
                    className="draftEditor"
                    rows="8"
                    value={editableDraft}
                    onChange={(event) =>
                      setEditableDraft(event.target.value)
                    }
                  />

                  <div className="disclosureBox">
                    <strong>
                      {draftSource === "ai"
                        ? ar.disclosure?.badge
                        : ar.disclosure?.template_badge}
                    </strong>

                    <p>
                      {draftSource === "ai"
                        ? ar.disclosure?.notice
                        : continuedAfterSupport
                          ? ar.disclosure?.after_support_notice
                          : ar.disclosure?.template_notice}
                    </p>

                    <p>
                      {statedLimits.ar_short}
                    </p>
                  </div>

                  <div className="draftActions">
                    <button
                      type="button"
                      className="secondaryButton"
                      onClick={handleCopy}
                    >
                      {ar.buttons?.copy}
                    </button>

                    <button
                      type="button"
                      className="primaryButton"
                      onClick={handleShare}
                    >
                      {ar.buttons?.share}
                    </button>
                  </div>

                  {copied && (
                    <p className="successMessage">
                      تم نسخ النص 
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================
              HANDOFF / READY
          ================================= */}

          {screen === "ready" && (
            <div className="screenPanel readyScreen">
              <div className="miniBridgeMark" style={{ marginBottom: "16px" }}>
                <img src="/brand/jisr-logo.png" alt="جسر" style={{ maxWidth: "140px" }} />
              </div>

              <div className="readyIcon">
                ✓
              </div>

              <h2>
                {ar.handoff?.ready_message}
              </h2>

              <p>
                {ar.handoff?.select_app}
              </p>

              <button
                type="button"
                className="secondaryButton"
                onClick={() => setScreen("drafts")}
              >
                رجوع
              </button>
            </div>
          )}
        </section>
      )}

      {/* ===================================
          SAME-SESSION TRIGGER
      =================================== */}

      {showTrigger && (
        <div className="modalOverlay">
          <div className="modalCard triggerModal">
            <button
              type="button"
              className="modalClose"
              aria-label="إغلاق"
              onClick={() => setShowTrigger(false)}
            >
              ×
            </button>

            <div className="modalIcon greenIcon">
              
            </div>

            <p className="triggerText">
              {ar.triggers?.same_session_prompt?.replace(
                "{chip}",
                selectedTopic
              )}
            </p>

            <div className="modalActions">
              <button
                type="button"
                className="primaryButton"
                onClick={handleStartDrafting}
              >
                {ar.buttons?.start_drafting}
              </button>

              <button
                type="button"
                className="secondaryButton"
                onClick={handleNotNow}
              >
                {ar.buttons?.not_now}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================
          SUPPORT / SAFETY
      =================================== */}

      {showSupport && (
        <div className="modalOverlay">
          <div className="modalCard supportModal">
            <button
              type="button"
              className="modalClose"
              aria-label="إغلاق"
              onClick={closeSupport}
            >
              ×
            </button>

            <div className="modalIcon safetyIcon">
              !
            </div>

            <h2>
              {supportCard.title_ar}
            </h2>

            <p>
              {supportCard.intro_ar}
            </p>

            {verifiedContacts.length > 0 ? (
              <div className="contactsList">
                {verifiedContacts.map(
                  (contact, index) => (
                    <div
                      className="contactCard"
                      key={index}
                    >
                      <strong>
                        {contact.name_ar}
                      </strong>

                      <p>
                        {contact.contact_info}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="fallbackSupport">
                <p>
                  {supportCard.fallback_statement_ar}
                </p>
              </div>
            )}

            <p className="supportGuidance">
              {supportCard.guidance_ar}
            </p>

            {/* After a risk flag the user may still write to someone they trust */}
            {supportIsCrisis && (
              <button
                type="button"
                className="primaryButton fullButton"
                onClick={handleContinueAfterSupport}
              >
                {ar.buttons?.continue_note}
              </button>
            )}

            <button
              type="button"
              className="secondaryButton fullButton"
              onClick={closeSupport}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </main>
  );
}