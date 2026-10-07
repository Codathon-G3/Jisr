"use client";

import { useMemo, useState } from "react";

import ar from "../i18n/ar.json";
import templates from "../../safety/plain-templates.json";
import supportCard from "../../safety/support-card.json";

const APP_NAME = "جسر";

const toneOrder = ["gentle", "direct", "formal"];

export default function Home() {
  const [selectedChips, setSelectedChips] = useState([]);
  const [text, setText] = useState("");
  const [recipient, setRecipient] = useState("");

  const [screen, setScreen] = useState("form");

  const [showTrigger, setShowTrigger] = useState(false);
  const [dismissedKey, setDismissedKey] = useState("");

  const [showSupport, setShowSupport] = useState(false);

  const [selectedTone, setSelectedTone] = useState("");
  const [editableDraft, setEditableDraft] = useState("");

  const [copied, setCopied] = useState(false);

  const chipIds = Object.keys(ar.chips);
  const recipientIds = Object.keys(ar.recipients);

  const selectedTopic = useMemo(() => {
    return selectedChips
      .map((id) => ar.chips[id])
      .filter(Boolean)
      .join("، ");
  }, [selectedChips]);

  const currentSelectionKey = useMemo(() => {
    return [...selectedChips].sort().join("|");
  }, [selectedChips]);

  const verifiedContacts = supportCard.contacts.filter(
    (contact) => contact.verified === true
  );

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

    if (currentSelectionKey === dismissedKey) {
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

    return template.replaceAll(
      "{topic}",
      selectedTopic || ar.chips.other
    );
  }

  function chooseTone(tone) {
    setSelectedTone(tone);
    setEditableDraft(createFallbackDraft(tone));
  }

  function handleYesHelpMe() {
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

      setTimeout(() => {
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
          title: APP_NAME,
          text: editableDraft,
        });

        setScreen("ready");
      } else {
        await navigator.clipboard.writeText(editableDraft);

        setCopied(true);

        setTimeout(() => {
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
    <main className="page">

      {/* زر التواصل البشري - موجود دائماً */}
      <button
        type="button"
        className="humanRouteButton"
        onClick={() => setShowSupport(true)}
      >
        {ar.buttons.talk_to_someone_now}
      </button>

      <section className="card">

        {/* ========================= */}
        {/* الشاشة الأولى */}
        {/* ========================= */}

        {screen === "form" && (
          <>
            <div className="brand">
              <div className="logoCircle">
                <span>ج</span>
              </div>

              <h1>{APP_NAME}</h1>

              <p>{ar.tagline}</p>
            </div>

            <div className="section">
              <h2>شن أكثر حاجة شاغلة بالك هالفترة؟</h2>

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
                {ar.writing_screen.text_prompt}
              </label>

              <textarea
                id="message"
                rows="4"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={ar.writing_screen.text_placeholder}
              />
            </div>

            <div className="section">
              <h2>
                {ar.writing_screen.recipient_prompt}
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
              نكمل
            </button>

            <p className="limits">
              {ar.notices.stated_limits}
            </p>
          </>
        )}

        {/* ========================= */}
        {/* شاشة المسودات */}
        {/* ========================= */}

        {screen === "drafts" && (
          <div className="draftScreen">

            <div className="brand smallBrand">
              <h1>{APP_NAME}</h1>
            </div>

            <h2>
              {ar.draft_screen.title}
            </h2>

            <p className="hint">
              اختر الأسلوب الأقرب ليك.
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
                  {ar.tones[tone]}
                </button>
              ))}
            </div>

            {selectedTone && (
              <div className="editorSection">

                <label htmlFor="draftEditor">
                  {ar.draft_screen.edit_prompt}
                </label>

                <textarea
                  id="draftEditor"
                  className="draftEditor"
                  rows="8"
                  value={editableDraft}
                  onChange={(event) =>
                    setEditableDraft(event.target.value)
                  }
                />

                <p className="aiDisclosure">
                  {ar.notices.ai_disclosure}
                </p>

                <div className="draftActions">

                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={handleCopy}
                  >
                    {ar.draft_screen.copy_btn}
                  </button>

                  <button
                    type="button"
                    className="primaryButton"
                    onClick={handleShare}
                  >
                    {ar.draft_screen.share_btn}
                  </button>

                </div>

                {copied && (
                  <p className="successMessage">
                    {ar.draft_screen.copied_toast}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              className="backButton"
              onClick={goBackToForm}
            >
              {ar.buttons.back}
            </button>

          </div>
        )}

        {/* ========================= */}
        {/* شاشة النهاية */}
        {/* ========================= */}

        {screen === "ready" && (
          <div className="readyScreen">

            <div className="readyIcon">
              ✓
            </div>

            <h1>
              {APP_NAME}
            </h1>

            <h2>
              {ar.notices.encouraged_out}
            </h2>

            <p>
              الرسالة ما تتبعتش تلقائياً.
              أنت اللي تقرر متى ومع من تشاركها.
            </p>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => setScreen("drafts")}
            >
              {ar.buttons.back}
            </button>

          </div>
        )}

      </section>

      {/* ========================= */}
      {/* Trigger */}
      {/* ========================= */}

      {showTrigger && (
        <div className="modalOverlay">

          <div className="modalCard">

            <h2>
              نقدروا نساعدوك تبدأ
            </h2>

            <p>
              {ar.triggers.same_session_prompt.replace(
                "{chip}",
                selectedTopic
              )}
            </p>

            <div className="modalActions">

              <button
                type="button"
                className="primaryButton"
                onClick={handleYesHelpMe}
              >
                {ar.triggers.accept_btn}
              </button>

              <button
                type="button"
                className="secondaryButton"
                onClick={handleNotNow}
              >
                {ar.triggers.decline_btn}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================= */}
      {/* Support Card */}
      {/* ========================= */}

      {showSupport && (
        <div className="modalOverlay">

          <div className="modalCard supportModal">

            <h2>
              {supportCard.title_ar}
            </h2>

            <p>
              {supportCard.intro_ar}
            </p>

            {verifiedContacts.length > 0 ? (
              <div className="contactsList">

                {verifiedContacts.map((contact, index) => (
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
                ))}

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
              className="primaryButton"
              onClick={() => setShowSupport(false)}
            >
              {ar.buttons.close}
            </button>

          </div>

        </div>
      )}

    </main>
  );
}