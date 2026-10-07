"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ar from "../i18n/ar.json";
import templates from "../../safety/plain-templates.json";
import supportCard from "../../safety/support-card.json";

const toneOrder = ["gentle", "direct", "formal"];

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

  const [selectedTone, setSelectedTone] = useState("");
  const [editableDraft, setEditableDraft] = useState("");

  const [copied, setCopied] = useState(false);

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

  function handleContinue() {
    if (selectedChips.length === 0 || !recipient) {
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

    const topic = selectedTopic || ar.chips?.other || "";

    return template.replaceAll("{topic}", topic);
  }

  function chooseTone(tone) {
    setSelectedTone(tone);
    setEditableDraft(createFallbackDraft(tone));
  }

  function handleStartDrafting() {
    setShowTrigger(false);
    chooseTone("gentle");
    setScreen("drafts");
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
        onClick={() => setShowSupport(true)}
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
                  <span>جسر</span>
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
                  recipient === ""
                }
                onClick={handleContinue}
              >
                {ar.buttons?.start_drafting}
              </button>

              <p className="limits">
                {ar.limits?.notice}
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
                    {ar.disclosure?.badge}
                  </span>

                  <h2>
                    اختر الصياغة اللي تريحك
                  </h2>
                </div>
              </div>

              <p className="hint">
                اختار الأسلوب الأقرب ليك،
                وبعدها تقدر تعدّل أي كلمة قبل المشاركة.
              </p>

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
                      {ar.disclosure?.badge}
                    </strong>

                    <p>
                      {ar.disclosure?.notice}
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
              <div className="readyIcon">
                
              </div>

              <span className="readyBrand">
                جسر
              </span>

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
              onClick={() => setShowSupport(false)}
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

            <button
              type="button"
              className="secondaryButton fullButton"
              onClick={() => setShowSupport(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </main>
  );
}