# -*- coding: utf-8 -*-
"""
Standalone PowerPoint Pitch Deck Generator for Jisr (جِسر)
Ai4LY National Codathon 2026 — منتدى ليبيا للذكاء الاصطناعي
Deliverable: docs/PITCH_DECK.pptx

Strictly adheres to Rayan's dark & amber brand palette:
- Background: #0E131B (Deep Navy)
- Cards: #161E2B (Slate Container)
- Border: #2A384C (Subtle Border)
- Accent: #F59E0B (Brand Amber Gold)
- Primary Text: #F1F5F9 (Crisp Primary Text)
- Secondary Text: #94A3B8 (Muted Slate Text)
- Success / Verified: #10B981 (Emerald Green)
- Danger / Crisis: #EF4444 (Crimson Red)

Presentation geometry: 16:9 Widescreen (13.333" x 7.5")
Authentic OpenXML DrawingML RTL support (<a:pPr rtl="1">) on all Arabic text.
Comprehensive dual-language speaker notes (Mohamed Thabet Arabic speech + English transcript).
"""

import os
import sys

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Rayan's Dark & Amber Brand Palette
BG_COLOR = RGBColor(14, 19, 27)        # #0E131B (Deep Navy Background)
CARD_BG = RGBColor(22, 30, 43)         # #161E2B (Slate Container Card)
CARD_BORDER = RGBColor(42, 56, 76)     # #2A384C (Subtle Container Border)
ACCENT_AMBER = RGBColor(245, 158, 11)  # #F59E0B (Brand Amber Gold)
TEXT_PRIMARY = RGBColor(241, 245, 249) # #F1F5F9 (Crisp Primary Text)
TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8 (Secondary Slate Text)
ACCENT_GREEN = RGBColor(16, 185, 129)  # #10B981 (Verified / Safe Metric)
ACCENT_RED = RGBColor(239, 68, 68)     # #EF4444 (Crisis / Danger Marker)
INNER_BOX_BG = RGBColor(16, 22, 32)    # #101620 (Nested Card Background)

FONT_FAMILY = "Segoe UI"


def set_rtl(paragraph):
    """Sets DrawingML rtl attribute on paragraph for native PowerPoint RTL text layout."""
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set('rtl', '1')


def add_slide_background(slide, prs):
    """Adds full-bleed background rectangle matching #0E131B."""
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    return bg


def add_header(slide, slide_num, time_str, title_ar, title_en, subtitle_ar, icon_path=None):
    """Adds uniform branded slide header with optional brand icon."""
    # Brand Icon (Top Left)
    left_offset = Inches(0.6)
    if icon_path and os.path.exists(icon_path):
        try:
            slide.shapes.add_picture(icon_path, Inches(0.6), Inches(0.32), Inches(0.42), Inches(0.42))
            left_offset = Inches(1.12)
        except Exception:
            left_offset = Inches(0.6)

    # Top event tag
    event_box = slide.shapes.add_textbox(left_offset, Inches(0.38), Inches(6.0), Inches(0.35))
    tf_ev = event_box.text_frame
    tf_ev.word_wrap = True
    p_ev = tf_ev.paragraphs[0]
    p_ev.text = "Ai4LY National Codathon 2026 — منتدى ليبيا للذكاء الاصطناعي"
    p_ev.font.name = FONT_FAMILY
    p_ev.font.size = Pt(11)
    p_ev.font.color.rgb = TEXT_MUTED
    p_ev.alignment = PP_ALIGN.LEFT

    # Slide Number & Timer Badge (Right)
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.3), Inches(0.38), Inches(2.4), Inches(0.35))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = ACCENT_AMBER
    badge.line.width = Pt(1)
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = f"الشريحة {slide_num}  |  {time_str}"
    p_b.font.name = FONT_FAMILY
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = ACCENT_AMBER
    p_b.alignment = PP_ALIGN.CENTER
    set_rtl(p_b)

    # Main Title
    title_box = slide.shapes.add_textbox(Inches(0.6), Inches(0.85), Inches(12.1), Inches(0.55))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = f"{title_ar}  —  {title_en}"
    p_t.font.name = FONT_FAMILY
    p_t.font.size = Pt(21)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_PRIMARY
    p_t.alignment = PP_ALIGN.RIGHT
    set_rtl(p_t)

    # Subtitle
    sub_box = slide.shapes.add_textbox(Inches(0.6), Inches(1.42), Inches(12.1), Inches(0.35))
    tf_s = sub_box.text_frame
    tf_s.word_wrap = True
    p_s = tf_s.paragraphs[0]
    p_s.text = subtitle_ar
    p_s.font.name = FONT_FAMILY
    p_s.font.size = Pt(12)
    p_s.font.color.rgb = TEXT_MUTED
    p_s.alignment = PP_ALIGN.RIGHT
    set_rtl(p_s)

    # Amber separator line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.85), Inches(12.1), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = ACCENT_AMBER
    line.line.fill.background()


def add_footer(slide):
    """Adds uniform footer across all slides."""
    foot_box = slide.shapes.add_textbox(Inches(0.6), Inches(7.02), Inches(12.1), Inches(0.35))
    tf = foot_box.text_frame
    p = tf.paragraphs[0]
    p.text = "جسر (Jisr) — محمد ثابت (رئيس الفريق)، ريان، معتز، شيماء  |  منتدى ليبيا للذكاء الاصطناعي 2026 (Ai4LY)"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED
    p.alignment = PP_ALIGN.CENTER
    set_rtl(p)


def add_card(slide, left, top, width, height, title=None, title_color=ACCENT_AMBER, bg_color=CARD_BG, border_color=CARD_BORDER):
    """Draws a container card and returns the shape and text_frame."""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)

    if title:
        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = title_color
        p0.alignment = PP_ALIGN.RIGHT
        set_rtl(p0)
        p0.space_after = Pt(8)

    return card, tf


def set_speaker_notes(slide, arabic_notes, english_notes):
    """Sets dual-language speaker notes on the slide."""
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = (
        f"[ملاحظات المتحدث — محمد ثابت (بالعربية)]:\n{arabic_notes}\n\n"
        f"[Speaker Notes — English Transcript]:\n{english_notes}"
    )


def build_slide_1(prs, icon_path):
    """Slide 1: The Problem (المشكلة — الصمت عند الجملة الأولى)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_slide_background(slide, prs)
    add_header(
        slide,
        slide_num=1,
        time_str="0:00 – 1:00",
        title_ar="المشكلة: الصمت عند الجملة الأولى",
        title_en="The Problem: The Silence at the First Sentence",
        subtitle_ar="العائق الأكبر أمام طلب المساعدة النفسية لدى الشباب في ليبيا ليس الرغبة، بل بدء الحديث",
        icon_path=icon_path
    )

    # Right Card: Friction Points (Arabic reading order: right to left)
    card_r, tf_r = add_card(slide, Inches(6.8), Inches(2.05), Inches(5.9), Inches(4.8), title="حواجز طلب المساعدة الثلاثة المركّبة (Friction Points)")
    points_r = [
        ("الوصمة الاجتماعية (Cultural Stigma):", "الخوف من إطلاق تسميات وأحكام نفسية أو إفشاء المشاكل العائلية، مما يدفع الشاب لكتمان ضغوطه خلف الأبواب المغلقة.", ACCENT_AMBER),
        ("الإرهاق والجمود النفسي (Overwhelm):", "تشتت التفكير وانخفاض طاقة التركيز وقت اشتداد الضغط، مما يسبب شللاً عاطفياً يعجز معه الشاب عن صياغة جملة مفهومة.", ACCENT_AMBER),
        ("تكلفة التعبير (Articulation Cost):", "التردد أمام شاشة المحادثة الفارغة لأكثر من 30 دقيقة، مما يؤدي إلى مسح الرسائل والتراجع عن طلب الدعم تماماً.", ACCENT_AMBER)
    ]
    for headline, desc, col in points_r:
        p_h = tf_r.add_paragraph()
        p_h.text = f"• {headline}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(12.5)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(8)
        set_rtl(p_h)

        p_d = tf_r.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_PRIMARY
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(6)
        set_rtl(p_d)

    # Left Card: Libyan Reality
    card_l, tf_l = add_card(slide, Inches(0.6), Inches(2.05), Inches(5.9), Inches(4.8), title="واقع البيئة الداعمة في ليبيا وتكلفة الصمت (Libyan Reality)")
    points_l = [
        ("ندرة الرعاية المتخصصة وتركزها الجغرافي:", "العيادات والأطباء النفسيون نادرون في مدننا، ولا يمكن أن يكونوا خط الدفاع الأول للضغوط الدراسية واليومية.", TEXT_MUTED),
        ("شبكة الدعم الطبيعية متوفرة بالفعل:", "الأخ، الأخت، الوالدان، والصديق المقرب مستعدون للمساندة — المانع الوحيد هو كسر حاجز البداية.", TEXT_MUTED),
        ("الخطر القاتل للصمت المبكر:", "الكتمان المستمر يحول ضغوط الامتحانات والعمل اليومية إلى أزمات حادة وانفجارات نفسية غير قابلة للاحتواء.", ACCENT_RED),
        ("رسالة جسر الأساسية:", "التدخل المبكر في أول 60 ثانية لإنهاء الصمت وفتح باب المحادثة الإنسانية المباشرة.", ACCENT_GREEN)
    ]
    for headline, desc, col in points_l:
        p_h = tf_l.add_paragraph()
        p_h.text = f"• {headline}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(12.5)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(6)
        set_rtl(p_h)

        p_d = tf_l.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_PRIMARY
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(4)
        set_rtl(p_d)

    add_footer(slide)

    set_speaker_notes(
        slide,
        arabic_notes=(
            "السلام عليكم أعضاء اللجنة الكرام.\n"
            "في قضايا الصحة النفسية لدى الشباب في ليبيا، نقطة الفشل الأولى والأخطر هي الصمت. "
            "عندما يتعرض الشاب لضغط الامتحانات، العائلة، أو العمل، المشكلة ليست أنه لا يريد المساعدة، "
            "بل أنه يقف متجمداً أمام شاشة هاتفه الفارغة محاولاً كتابة الجملة الأولى لأخيه أو صديقه.\n"
            "في مجتمعنا، تتضافر الوصمة الاجتماعية مع الإرهاق النفسي لفرض الصمت حتى تتحول الضغوط البسيطة إلى أزمات حادة. "
            "اليوم نقدم لكم 'جسر' — رفيق كتابة ذكي هدفه كسر هذا الصمت في أول 60 ثانية وربط الإنسان بالإنسان."
        ),
        english_notes=(
            "Peace be upon you, honorable committee members. In mental health struggles among Libyan youth, "
            "the fatal failure mode is silence. When a young student is overwhelmed by exams or family pressure, "
            "the hardest step is not wanting help—it is staring at a blank screen trying to articulate the first sentence. "
            "Stigma and overwhelm freeze people into silence until stress turns into crisis. Today we present Jisr: "
            "an AI writing companion built with one singular mission: end the silence early and connect human to human."
        )
    )


def build_slide_2(prs, icon_path):
    """Slide 2: The Solution (الحل: جسر — رفيق كتابة لربط الإنسان بالإنسان)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_slide_background(slide, prs)
    add_header(
        slide,
        slide_num=2,
        time_str="1:00 – 2:00",
        title_ar="الحل: جسر (Jisr) — رفيق كتابة لربط الإنسان بالإنسان",
        title_en="The Solution: Human-to-Human Writing Companion",
        subtitle_ar="يكسر حاجز الصمت في 60 ثانية... ثم يفسح المجال للمحادثة الإنسانية الحقيقية",
        icon_path=icon_path
    )

    # Top Flow Container Card
    add_card(slide, Inches(0.6), Inches(2.05), Inches(12.1), Inches(1.5), title="المسار الخطي السريع في 60 ثانية (The 60-Second Linear Flow)")

    steps = [
        ("1. اختيار الموضوع", "7 رقائق ضغوط"),
        ("2. محفز هادئ", "دعوة لطيفة للكتابة"),
        ("3. سطر أو سطرين", "إدخال عفوي اختياري"),
        ("4. فحص الحارس", "أمان مسبق فوري"),
        ("5. 3 صياغات", "لطيف • مباشر • رسمي"),
        ("6. مشاركة مباشرة", "تصدير لواتساب فوراً")
    ]
    step_w = Inches(1.85)
    step_gap = Inches(0.16)
    start_x = Inches(0.8)
    for i, (stitle, ssub) in enumerate(steps):
        # RTL placement: step 1 on far right, step 6 on far left
        x_pos = start_x + (5 - i) * (step_w + step_gap)
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_pos, Inches(2.65), step_w, Inches(0.72))
        s_box.fill.solid()
        s_box.fill.fore_color.rgb = INNER_BOX_BG
        s_box.line.color.rgb = ACCENT_AMBER if i in [0, 3, 5] else CARD_BORDER
        s_box.line.width = Pt(1)
        s_tf = s_box.text_frame
        s_tf.word_wrap = True
        s_tf.margin_left = Inches(0.08)
        s_tf.margin_right = Inches(0.08)
        s_tf.margin_top = Inches(0.08)
        s_tf.margin_bottom = Inches(0.08)

        s_p1 = s_tf.paragraphs[0]
        s_p1.text = stitle
        s_p1.font.name = FONT_FAMILY
        s_p1.font.size = Pt(10)
        s_p1.font.bold = True
        s_p1.font.color.rgb = ACCENT_AMBER if i in [0, 3, 5] else TEXT_PRIMARY
        s_p1.alignment = PP_ALIGN.CENTER
        set_rtl(s_p1)

        s_p2 = s_tf.add_paragraph()
        s_p2.text = ssub
        s_p2.font.name = FONT_FAMILY
        s_p2.font.size = Pt(8.5)
        s_p2.font.color.rgb = TEXT_MUTED
        s_p2.alignment = PP_ALIGN.CENTER
        set_rtl(s_p2)

    # Bottom Right Card: 4 Architectural Layers
    card_layers, tf_layers = add_card(slide, Inches(6.8), Inches(3.75), Inches(5.9), Inches(3.1), title="الطبقات الأربع للمنظومة التقنية (4 Architectural Layers)")
    layer_points = [
        ("1. طبقة الالتقاط (Capture Layer):", "7 رقائق ضغوط يومية + 5 فئات مستقبلين (صديق، والدين، أخ، أستاذ) بواجهة RTL سريعة.", TEXT_PRIMARY),
        ("2. طبقة الحارس (Guardian Layer):", "فحص مسبق لعبارات الأزمات باللهجة الليبية وبطاقة دعم ثابتة وفلترة مخرجات قطعية.", ACCENT_AMBER),
        ("3. محرك الصياغة (Drafting Engine):", "توليد 3 نبرات متكيفة لغوياً (لطيف، مباشر، رسمي) مع تعديل يدوي في المكان.", TEXT_PRIMARY),
        ("4. طبقة الثقة والمشاركة (Trust & Sharing):", "مقارنة حية مع القالب وفحص مطابقة وتصدير لواتساب وماسنجر بدون أثر.", ACCENT_GREEN)
    ]
    for headline, desc, col in layer_points:
        p_h = tf_layers.add_paragraph()
        p_h.text = f"• {headline}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(11)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(3)
        set_rtl(p_h)

        p_d = tf_layers.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(2)
        set_rtl(p_d)

    # Bottom Left Card: What We Are NOT
    card_not, tf_not = add_card(slide, Inches(0.6), Inches(3.75), Inches(5.9), Inches(3.1), title="فلسفة جسر المغايرة والحدود الأخلاقية (What We Are NOT)")
    not_points = [
        ("لسنا روبوت محادثة (Not a Chatbot):", "لا نجر المستخدم لحوارات شاشة وهمية قد تزيد العزلة والارتباط بالآلة.", ACCENT_RED),
        ("لسنا معالجاً بديلاً (Not a Therapist):", "لا نشخص أمراضاً ولا نضع تسميات طبية ولا نصف أدوية أو بروتوكولات علاجية.", ACCENT_RED),
        ("هدفنا الخروج السريع (Rapid Exit):", "النجاح يقاس بلحظة إغلاق التطبيق وبدء المحادثة الفعلية مع الأخ أو الصديق.", ACCENT_GREEN),
        ("المستخدم هو المؤلف والمتحكم دائماً:", "الذكاء الاصطناعي يقترح فقط، والشاب يراجع، يعدل، ويرسل بنفسه.", ACCENT_AMBER)
    ]
    for headline, desc, col in not_points:
        p_h = tf_not.add_paragraph()
        p_h.text = f"{headline}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(11)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(3)
        set_rtl(p_h)

        p_d = tf_not.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_PRIMARY
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(2)
        set_rtl(p_d)

    add_footer(slide)

    set_speaker_notes(
        slide,
        arabic_notes=(
            "جسر يختلف جذرياً عن تطبيقات الصحة النفسية الشائعة. نحن لم نبنِ روبوت محادثة، "
            "ولا ندّعي تقديم علاج نفسي آلي. المستخدم ببساطة يحدد موضوع ضغطه بنقرة واحدة مثل الامتحانات، "
            "ويكتب سطراً أو سطرين بعفويته. جسر يفحص الأمان فورياً، ويولد ثلاث صياغات مهذبة تناسب المتلقي، "
            "ويمكّنه من إرسالها مباشرة عبر واتساب أو ماسنجر. "
            "الشاب هو المؤلف والمتحكم دائماً، واللحظة التي يغلق فيها تطبيقنا ليتحدث مع أخته أو صديقه، تكون مهمة جسر قد نجحت بالكامل."
        ),
        english_notes=(
            "Jisr is fundamentally different from generic AI health apps: we did not build a conversational chatbot, "
            "and we do not pretend to be an artificial therapist. The user simply taps everyday situation chips "
            "and writes 1-2 lines. Jisr runs an immediate safety check, produces three editable tone-adapted drafts "
            "tailored for their recipient, and lets them share directly through WhatsApp or Messenger. "
            "The moment the user closes our app to talk to their friend, Jisr has succeeded."
        )
    )


def build_slide_3(prs, icon_path):
    """Slide 3: Real AI Utility & Baseline Diff (الفائدة الحقيقية والفرق عن الذكاء التجاري)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_slide_background(slide, prs)
    add_header(
        slide,
        slide_num=3,
        time_str="2:00 – 3:00",
        title_ar="الفائدة الحقيقية للذكاء الاصطناعي ومقارنة الأساس (Baseline Diff)",
        title_en="Real AI Utility vs. Decorative AI & Baseline Diff",
        subtitle_ar="لماذا تعجز القوالب الثابتة؟ وكيف نثبت القيمة المضافة عملياً داخل التطبيق بنقرة واحدة",
        icon_path=icon_path
    )

    # Right Card: 4 Concrete AI Functions
    card_r, tf_r = add_card(slide, Inches(6.8), Inches(2.05), Inches(5.9), Inches(4.8), title="4 ركائز للذكاء الاصطناعي الحقيقي (Real AI Utility)")
    functions = [
        ("1. هيكلة النص الفوضوي (Free-Text Structuring):", "تفكيك الكلمات العفوية (مثل: 'مش قادر نقرا وبابا يضغط عليا') إلى موقف، أثر، واحتياج واضح — وهو ما تعجز عنه استمارات الإدخال الجامدة.", ACCENT_AMBER),
        ("2. ملاءمة النبرة والمقام (Audience & Tone Adaptation):", "تكييف المفردات والهيبة الاجتماعية؛ فالصياغة للصديق تختلف كلياً عن الوالدين أو الأستاذ، دون ابتذال أو برود.", TEXT_PRIMARY),
        ("3. فحص مطابقة المصدر (Faithfulness Alignment):", "التحقق الحسابي من أن كل جملة مولدة مشتقة مباشرة من مدخلات الشاب، لمنع اختلاق مشاعر أو وقائع غير حقيقية.", ACCENT_GREEN),
        ("4. تصنيف أزمات اللهجة (Dialect Risk Classification):", "فهم الاستعارات والتعبيرات الليبية الدارجة ورموز Arabizi قبل محرك الصياغة، وهو ما تتجاوزه الكلمات المفتاحية البسيطة.", ACCENT_AMBER)
    ]
    for headline, desc, col in functions:
        p_h = tf_r.add_paragraph()
        p_h.text = headline
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(12)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(5)
        set_rtl(p_h)

        p_d = tf_r.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(4)
        set_rtl(p_d)

    # Left Card: Live Baseline Comparison Toggle
    add_card(slide, Inches(0.6), Inches(2.05), Inches(5.9), Inches(4.8), title="زر المقارنة الحية المدمج (Live Baseline Toggle)")

    # Intro line inside card
    intro_box = slide.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(5.5), Inches(0.4))
    tf_in = intro_box.text_frame
    tf_in.word_wrap = True
    p_in = tf_in.paragraphs[0]
    p_in.text = "تطبيقاً لمعيار الكوداثون الصارم برفض 'الذكاء الشكلي'، بنينا مقارنة مباشرة جنباً إلى جنب داخل التطبيق:"
    p_in.font.name = FONT_FAMILY
    p_in.font.size = Pt(10.5)
    p_in.font.color.rgb = TEXT_PRIMARY
    p_in.alignment = PP_ALIGN.RIGHT
    set_rtl(p_in)

    # AI Draft Box (Amber Border)
    sub1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.95), Inches(5.5), Inches(1.2))
    sub1.fill.solid()
    sub1.fill.fore_color.rgb = INNER_BOX_BG
    sub1.line.color.rgb = ACCENT_AMBER
    sub1.line.width = Pt(1)
    tf_s1 = sub1.text_frame
    tf_s1.word_wrap = True
    tf_s1.margin_left = Inches(0.15)
    tf_s1.margin_right = Inches(0.15)
    tf_s1.margin_top = Inches(0.12)
    tf_s1.margin_bottom = Inches(0.12)

    p_s1_t = tf_s1.paragraphs[0]
    p_s1_t.text = "صياغة الذكاء الاصطناعي (جسر — نبرة لطيفة للأم):"
    p_s1_t.font.name = FONT_FAMILY
    p_s1_t.font.size = Pt(10.5)
    p_s1_t.font.bold = True
    p_s1_t.font.color.rgb = ACCENT_AMBER
    p_s1_t.alignment = PP_ALIGN.RIGHT
    set_rtl(p_s1_t)

    p_s1_b = tf_s1.add_paragraph()
    p_s1_b.text = "«أمي الغالية، حبيت نقولك إني مضغوط شوية الفترة هادي من الامتحانات ومش قادر نركز، محتاج دعواتك ونتكلم معاك شوية لما تفضي.»"
    p_s1_b.font.name = FONT_FAMILY
    p_s1_b.font.size = Pt(10)
    p_s1_b.font.color.rgb = TEXT_PRIMARY
    p_s1_b.alignment = PP_ALIGN.RIGHT
    p_s1_b.space_before = Pt(3)
    set_rtl(p_s1_b)

    # Baseline Static Template Box (Muted Border)
    sub2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.25), Inches(5.5), Inches(1.05))
    sub2.fill.solid()
    sub2.fill.fore_color.rgb = INNER_BOX_BG
    sub2.line.color.rgb = CARD_BORDER
    sub2.line.width = Pt(1)
    tf_s2 = sub2.text_frame
    tf_s2.word_wrap = True
    tf_s2.margin_left = Inches(0.15)
    tf_s2.margin_right = Inches(0.15)
    tf_s2.margin_top = Inches(0.12)
    tf_s2.margin_bottom = Inches(0.12)

    p_s2_t = tf_s2.paragraphs[0]
    p_s2_t.text = "القالب الثابت التقليدي (Static Baseline Template):"
    p_s2_t.font.name = FONT_FAMILY
    p_s2_t.font.size = Pt(10.5)
    p_s2_t.font.bold = True
    p_s2_t.font.color.rgb = TEXT_MUTED
    p_s2_t.alignment = PP_ALIGN.RIGHT
    set_rtl(p_s2_t)

    p_s2_b = tf_s2.add_paragraph()
    p_s2_b.text = "«أنا أشعر بالضغط بخصوص الامتحانات وأود التحدث معك حول هذا الموضوع.»"
    p_s2_b.font.name = FONT_FAMILY
    p_s2_b.font.size = Pt(10)
    p_s2_b.font.color.rgb = TEXT_MUTED
    p_s2_b.alignment = PP_ALIGN.RIGHT
    p_s2_b.space_before = Pt(3)
    set_rtl(p_s2_b)

    # Evaluator Comparison Insight Box (Green Border)
    sub3 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.40), Inches(5.5), Inches(1.3))
    sub3.fill.solid()
    sub3.fill.fore_color.rgb = INNER_BOX_BG
    sub3.line.color.rgb = ACCENT_GREEN
    sub3.line.width = Pt(1)
    tf_s3 = sub3.text_frame
    tf_s3.word_wrap = True
    tf_s3.margin_left = Inches(0.15)
    tf_s3.margin_right = Inches(0.15)
    tf_s3.margin_top = Inches(0.1)
    tf_s3.margin_bottom = Inches(0.1)

    p_s3_t = tf_s3.paragraphs[0]
    p_s3_t.text = "الفارق العملي المقاس في التقييم:"
    p_s3_t.font.name = FONT_FAMILY
    p_s3_t.font.size = Pt(10.5)
    p_s3_t.font.bold = True
    p_s3_t.font.color.rgb = ACCENT_GREEN
    p_s3_t.alignment = PP_ALIGN.RIGHT
    set_rtl(p_s3_t)

    p_s3_b = tf_s3.add_paragraph()
    p_s3_b.text = "القالب يبدو آلياً ومحرجاً، بينما صياغة جسر الذكية تنبض بالدفء الإنساني وخصوصية اللهجة والمقام الأسري — مما يكسر حاجز الصمت فورياً."
    p_s3_b.font.name = FONT_FAMILY
    p_s3_b.font.size = Pt(9.5)
    p_s3_b.font.color.rgb = TEXT_PRIMARY
    p_s3_b.alignment = PP_ALIGN.RIGHT
    p_s3_b.space_before = Pt(2)
    set_rtl(p_s3_b)

    add_footer(slide)

    set_speaker_notes(
        slide,
        arabic_notes=(
            "كما أكدت اللجنة التوجيهية، وضع وسم 'ذكاء اصطناعي' على فكرة ليس كافياً. "
            "في جسر، الذكاء الاصطناعي يؤدي أربع مهام لغوية حقيقية لا تستطيع القوالب القيام بها: "
            "تفكيك الكلمات العفوية، ضبط المقام الاجتماعي، التدقيق على عدم اختلاق مشاعر، وتصنيف اللهجة. "
            "وحتى نثبت ذلك، بنينا زر مقارنة حية داخل التطبيق يضع النصين جنباً إلى جنب أمام المقيم والشباب."
        ),
        english_notes=(
            "As emphasized in the Codathon guidelines, simply labeling a project 'AI-based' is not enough. "
            "In Jisr, AI performs four precise tasks that forms and rules cannot do: restructures chaotic thoughts, "
            "adapts tone between close friends vs teachers, verifies faithfulness to prevent invented feelings, "
            "and classifies dialect risk. We built a live Baseline Comparison toggle directly into the app so judges "
            "can see the exact difference between our AI draft and a generic template."
        )
    )


def build_slide_4(prs, icon_path):
    """Slide 4: Safety Guardian Layer (طبقة الحراسة والأمان)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_slide_background(slide, prs)
    add_header(
        slide,
        slide_num=4,
        time_str="3:00 – 4:00",
        title_ar="طبقة الحارس والأمان (Safety Guardian Layer: Safe Before Helpful)",
        title_en="Safety Guardian Layer: Safe Before Helpful",
        subtitle_ar="الأمان يسبق المساعدة: فحص مسبق، خصوصية صفرية، وأرقام قياسية مقاسة علمياً",
        icon_path=icon_path
    )

    # Right Card: 3-Stage Safety Architecture
    card_r, tf_r = add_card(slide, Inches(6.8), Inches(2.05), Inches(5.9), Inches(4.8), title="المعمارية الأمنية ثلاثية المراحل (3-Stage Safety Architecture)")
    stages = [
        ("المرحلة 1: الفحص المسبق (Pre-Drafting Risk Gate)", "فحص مدخلات المستخدم قبل وصولها للذكاء الاصطناعي. عند اكتشاف مؤشر أزمة حادة باللهجة، يُعلّق التوليد فوراً وبدون أي تأخير.", ACCENT_AMBER),
        ("المرحلة 2: كارت الدعم الثابت المعتمد (Support Card Modal)", "عرض رسالة الطوارئ المعتمدة مع تجنب كتابة أرقام خطوط ساخنة وهمية أو غير محققة (contacts: []) للحفاظ على أمان المستخدم.", ACCENT_RED),
        ("المرحلة 3: فلترة المخرجات القطعية (Deterministic Output Guard)", "فحص المسودات الناتجة بقائمة حظر تضم 55 مصطلحاً تشخيصياً ودوائياً (أدوية، اضطرابات) لمنع أي ادعاء طبي نهائياً.", ACCENT_AMBER),
        ("طريق بشري دائم (Persistent Human Route)", "زر «تكلم مع حد توا» متواجد في جميع الشاشات للوصول الفوري للإنسان دون انتظار أي خوارزمية.", ACCENT_GREEN)
    ]
    for headline, desc, col in stages:
        p_h = tf_r.add_paragraph()
        p_h.text = f"• {headline}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(11.5)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(5)
        set_rtl(p_h)

        p_d = tf_r.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(3)
        set_rtl(p_d)

    # Left Card: Empirical Benchmarks & Zero Data Retention
    add_card(slide, Inches(0.6), Inches(2.05), Inches(5.9), Inches(4.8), title="نتائج القياس العلمي والخصوصية المطلقة (Empirical Benchmarks & Privacy)")

    # Benchmark Results Box (Green Border)
    m_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.55), Inches(5.5), Inches(2.05))
    m_box.fill.solid()
    m_box.fill.fore_color.rgb = INNER_BOX_BG
    m_box.line.color.rgb = ACCENT_GREEN
    m_box.line.width = Pt(1)
    tf_m = m_box.text_frame
    tf_m.word_wrap = True
    tf_m.margin_left = Inches(0.15)
    tf_m.margin_right = Inches(0.15)
    tf_m.margin_top = Inches(0.1)
    tf_m.margin_bottom = Inches(0.1)

    p_m0 = tf_m.paragraphs[0]
    p_m0.text = "نتائج القياس على معيار الأزمات التخليقي (N=25 — Dev Set):"
    p_m0.font.name = FONT_FAMILY
    p_m0.font.size = Pt(11)
    p_m0.font.bold = True
    p_m0.font.color.rgb = ACCENT_GREEN
    p_m0.alignment = PP_ALIGN.RIGHT
    set_rtl(p_m0)

    metrics = [
        ("نسبة التقاط الأزمات (Crisis Recall):", "100.0% (10/10 حالات — مجال ويلسون 72.2% – 100%)", ACCENT_GREEN),
        ("معدل الإنذار الخاطئ (False-Alarm):", "0.0% (0/11 حالات ضغط آمنة تم تمريرها)", ACCENT_GREEN),
        ("معجم الأزمات الليبية:", "60 عبارة أزمة محققة تغطي 360+ صياغة دارجة", ACCENT_AMBER),
        ("قائمة المصطلحات المحظورة:", "55 مصطلحاً طبياً ودوائياً محظورة قطعياً بنسبة 100%", ACCENT_AMBER)
    ]
    for m_label, m_val, col in metrics:
        p_met = tf_m.add_paragraph()
        p_met.text = f"• {m_label} {m_val}"
        p_met.font.name = FONT_FAMILY
        p_met.font.size = Pt(9.5)
        p_met.font.color.rgb = TEXT_PRIMARY
        p_met.alignment = PP_ALIGN.RIGHT
        p_met.space_before = Pt(2)
        set_rtl(p_met)

    # Privacy Box (Amber Border)
    priv_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.75), Inches(5.5), Inches(1.95))
    priv_box.fill.solid()
    priv_box.fill.fore_color.rgb = INNER_BOX_BG
    priv_box.line.color.rgb = ACCENT_AMBER
    priv_box.line.width = Pt(1)
    tf_p = priv_box.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = Inches(0.15)
    tf_p.margin_right = Inches(0.15)
    tf_p.margin_top = Inches(0.1)
    tf_p.margin_bottom = Inches(0.1)

    p_priv_t = tf_p.paragraphs[0]
    p_priv_t.text = "الخصوصية الصفرية وحماية الهوية (Zero-Data-Retention):"
    p_priv_t.font.name = FONT_FAMILY
    p_priv_t.font.size = Pt(11)
    p_priv_t.font.bold = True
    p_priv_t.font.color.rgb = ACCENT_AMBER
    p_priv_t.alignment = PP_ALIGN.RIGHT
    set_rtl(p_priv_t)

    priv_bullets = [
        "• بدون حسابات أو تسجيل: لا نطلب بريداً، لا أسماء، ولا نخزن بيانات على أي خادم خارجي.",
        "• تطهير فوري للبيانات (PII Sanitizer): حجب أرقام الهواتف والأسماء محلياً قبل التوليد.",
        "• ذاكرة معزولة ومسح بنقرة واحدة: التخزين محلي على الجهاز فقط ويمكن حذفه فوراً."
    ]
    for b in priv_bullets:
        p_b = tf_p.add_paragraph()
        p_b.text = b
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(9.5)
        p_b.font.color.rgb = TEXT_PRIMARY
        p_b.alignment = PP_ALIGN.RIGHT
        p_b.space_before = Pt(2)
        set_rtl(p_b)

    add_footer(slide)

    set_speaker_notes(
        slide,
        arabic_notes=(
            "الأمان في هذا المجال أولوية مطلقة. قبل أن يصل النص إلى محرك الصياغة، "
            "تفحص طبقة الحارس عبارات الأزمة باللهجة الليبية بدقة 100%. "
            "وإذا وُجد خطر، تتوقف الصياغة وتظهر بطاقة دعم بشرية موثوقة بدون أرقام وهمية. "
            "وتمنع فلترة المخرجات 55 مصطلحاً طبياً من الظهور في أي مسودة. "
            "وعلى صعيد الخصوصية: جسر لا يطلب حساباً ولا يحتفظ بأي أثر للرسائل على أي سيرفر خارجي. "
            "لحظات الضعف تبقى ملكاً للمستخدم وحده."
        ),
        english_notes=(
            "Safety in this space cannot be an afterthought. Before any text ever reaches drafting, "
            "our Guardian Layer screens for crisis indicators across Libyan dialect with 100% recall. "
            "If crisis is detected, drafting stops immediately and a verified human support card is presented. "
            "Furthermore, our output filter guarantees no clinical diagnoses or medication terms can ever appear. "
            "And on privacy: Jisr requires no accounts, no logins, and retains zero data on any server."
        )
    )


def build_slide_5(prs, icon_path):
    """Slide 5: Libya Feasibility & Team Roles (الجدوى في ليبيا وفريق العمل)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_slide_background(slide, prs)
    add_header(
        slide,
        slide_num=5,
        time_str="4:00 – 5:00",
        title_ar="الجدوى في واقع ليبيا وفريق العمل (Libya Feasibility & Team Roles)",
        title_en="Built for Libyan Reality & 4-Person Engineering Ownership",
        subtitle_ar="مصمم لظروف البنية التحتية الليبية، وتكامل الاختصاصات الهندسية الأربعة للفريق",
        icon_path=icon_path
    )

    # Right Card: Libya Feasibility
    card_r, tf_r = add_card(slide, Inches(6.8), Inches(2.05), Inches(5.9), Inches(4.8), title="الملائمة لواقع البنية التحتية والمجتمع في ليبيا (Libya Feasibility)")
    feasibility = [
        ("حزمة Android APK مستقلة (builds/jisr-v1.0.0.apk):", "تطبيق حقيقي جاهز للتثبيت الفوري لجميع أجهزة أندرويد دون الحاجة لمتجر Google Play أو بيئات برمجية معقدة.", ACCENT_AMBER),
        ("صمود تام أمام انقطاع الإنترنت والكهرباء:", "استهلاك شبكة خفيف جداً (<2KB)، مع تحول تلقائي وفوري للقوالب المحلية (safety/plain-templates.json) عند انقطاع الاتصال.", ACCENT_GREEN),
        ("اللهجة الليبية البيضاء والثقافة الأسرية:", "مُعاير لعبارات الشباب اليومية (مضغوط، تعبان، مخنوق)، ومراعاة مكانة الوالدين والإخوة كأول خط دعم إنساني طبيعي.", TEXT_PRIMARY),
        ("التصدير المباشر لواتساب وماسنجر:", "مشاركة بضغطة زر واحدة عبر التطبيقات التي يستخدمها أكثر من 90% من شباب ليبيا دون أي خادم وسيط.", ACCENT_AMBER)
    ]
    for headline, desc, col in feasibility:
        p_h = tf_r.add_paragraph()
        p_h.text = headline
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(11.5)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(5)
        set_rtl(p_h)

        p_d = tf_r.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(4)
        set_rtl(p_d)

    # Prominent APK Badge Icon embedded inside right card top-left
    if icon_path and os.path.exists(icon_path):
        try:
            slide.shapes.add_picture(icon_path, Inches(7.0), Inches(2.18), Inches(0.65), Inches(0.65))
        except Exception:
            pass

    # Left Card: Team Engineering Ownership
    card_l, tf_l = add_card(slide, Inches(0.6), Inches(2.05), Inches(5.9), Inches(4.8), title="فريق العمل وتوزيع المسؤوليات (Team Engineering Ownership)")
    team_members = [
        ("محمد ثابت (Mohamed Thabet) — قائد الفريق (Team Leader):", "المعمارية، التوثيق الفني (REPORT.md)، عروض التحكيم، واجهات الثقة (BaselineComparison, FaithfulnessView, OutboundPreview)، والتدقيق اللغوي.", ACCENT_AMBER),
        ("ريان (Rayan) — مهندس الواجهات وتطبيق المحمول (Mobile Lead):", "تطبيق React Native/Expo، الـ 7 رقائق، زر الطريق البشري («تكلم مع حد توا»)، وحزم الـ APK المستقل (builds/jisr-v1.0.0.apk).", TEXT_PRIMARY),
        ("معتز (Muatz) — مهندس الذكاء الاصطناعي والخلفية (AI & Backend):", "خادم FastAPI المستقل، توجيه نماذج Gemini 1.5 Flash و Groq Llama 3.3، وتطهير البيانات الحساسة PII.", TEXT_PRIMARY),
        ("شيماء (Shima) — مهندسة الأمان وطبقة الحارس (Safety Engineer):", "معجم الأزمات الليبية (60 عبارة)، قائمة حظر المصطلحات (55 مصطلحاً)، واختبارات الأمان الـ 450 واختبارات Parity.", ACCENT_GREEN)
    ]
    for member, desc, col in team_members:
        p_h = tf_l.add_paragraph()
        p_h.text = f"• {member}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(11.5)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.alignment = PP_ALIGN.RIGHT
        p_h.space_before = Pt(5)
        set_rtl(p_h)

        p_d = tf_l.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.RIGHT
        p_d.space_after = Pt(4)
        set_rtl(p_d)

    add_footer(slide)

    set_speaker_notes(
        slide,
        arabic_notes=(
            "جسر صُمم ليعيش في الواقع الليبي: تطبيق APK خفيف يعمل على أي هاتف، "
            "لا يحتاج إنترنت قوي بفضل القوالب البديلة، يفهم لهجتنا، يحترم مكانة العائلة، "
            "ويرتبط مباشرة بواتساب وماسنجر.\n"
            "يقف وراء هذا المشروع فريق متكامل: محمد ثابت في القيادة والمعمارية واللغة، "
            "ريان في تطبيق المحمول والـ APK، معتز في خادم الذكاء الاصطناعي والنماذج، "
            "وشيماء في طبقة الأمان واختباراتها الـ 450.\n"
            "بإزالة عائق الجملة الأولى، جسر يحول الصمت إلى حوار إنساني منقذ. شكراً لكم، ونتشرف بأسئلتكم وملاحظاتكم."
        ),
        english_notes=(
            "Jisr was built for Libyan reality: packaged as a lightweight downloadable Android APK, "
            "operates with zero bandwidth using deterministic fallback templates, understands authentic Libyan dialect, "
            "respects family structures, and connects directly to WhatsApp and Messenger. "
            "Our 4-person team executed rigorous engineering across mobile, AI backend, safety benchmarks, and trust UI. "
            "By removing the friction of the first sentence, Jisr helps young Libyans turn silence into early, "
            "life-changing human conversations. Thank you, and we welcome your questions."
        )
    )


def generate_deck(output_path):
    """Generates the complete 5-slide pitch deck presentation."""
    abs_output = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_output), exist_ok=True)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icon_path = os.path.join(root_dir, "assets", "icon.png")
    if not os.path.exists(icon_path):
        icon_path = None

    print(f"Generating 16:9 widescreen presentation: {abs_output}")
    print(f"Icon asset path: {icon_path} (exists: {os.path.exists(icon_path) if icon_path else False})")

    print("Building Slide 1: The Problem...")
    build_slide_1(prs, icon_path)

    print("Building Slide 2: The Solution (Jisr)...")
    build_slide_2(prs, icon_path)

    print("Building Slide 3: Real AI Utility & Baseline Diff...")
    build_slide_3(prs, icon_path)

    print("Building Slide 4: Safety Guardian Layer...")
    build_slide_4(prs, icon_path)

    print("Building Slide 5: Libya Feasibility & Team Roles...")
    build_slide_5(prs, icon_path)

    prs.save(abs_output)
    print(f"SUCCESS: Presentation saved to {abs_output}")
    print(f"File size: {os.path.getsize(abs_output):,} bytes")


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join("docs", "PITCH_DECK.pptx")
    generate_deck(target)
