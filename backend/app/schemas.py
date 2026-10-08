from typing import Literal

from pydantic import BaseModel, Field, model_validator

Chip = Literal["exams", "family", "work", "relationships", "sleep", "money", "other"]
Recipient = Literal["friend", "sibling", "parent", "trusted_adult", "counsellor"]
Tone = Literal["gentle", "direct", "formal"]
RiskMethod = Literal["none", "phrase", "model", "both"]
Placeholder = Literal["[name]", "[phone]", "[email]"]
DRAFT_ORDER: tuple[Tone, ...] = ("gentle", "direct", "formal")


class CheckRiskRequest(BaseModel):
    text: str = ""
    chips: list[Chip] = Field(default_factory=list)
    language: Literal["ar"] = "ar"


class CheckRiskResponse(BaseModel):
    riskDetected: bool
    method: RiskMethod

    @model_validator(mode="after")
    def method_matches_detection(self) -> "CheckRiskResponse":
        if self.riskDetected and self.method == "none":
            raise ValueError("method cannot be none when risk is detected")
        if not self.riskDetected and self.method != "none":
            raise ValueError("method must be none when no risk is detected")
        return self


class GenerateDraftsRequest(BaseModel):
    text: str = ""
    chips: list[Chip] = Field(default_factory=list)
    recipient: Recipient
    language: Literal["ar"] = "ar"


class IdentifierRemoved(BaseModel):
    original: str
    placeholder: Placeholder


class Draft(BaseModel):
    tone: Tone
    text: str


class GenerateDraftsResponse(BaseModel):
    sanitisedText: str
    identifiersRemoved: list[IdentifierRemoved]
    drafts: list[Draft]
    outputCheckPassed: bool
    usedFallbackTemplate: bool
    riskDetected: bool = False
    riskMethod: RiskMethod = "none"

    @model_validator(mode="after")
    def drafts_are_three_tones_in_order(self) -> "GenerateDraftsResponse":
        tones = [draft.tone for draft in self.drafts]
        if self.riskDetected:
            if tones:
                raise ValueError("no drafts may be returned when risk is detected")
            if self.riskMethod == "none":
                raise ValueError("riskMethod cannot be none when risk is detected")
            return self
        if tones != list(DRAFT_ORDER):
            raise ValueError("drafts must be exactly gentle, direct, then formal")
        return self


class FaithfulnessRequest(BaseModel):
    originalText: str
    draft: str


class Alignment(BaseModel):
    draftPhrase: str
    inputPhrase: str


class FaithfulnessResponse(BaseModel):
    alignments: list[Alignment]
