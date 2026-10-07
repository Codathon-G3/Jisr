from app.services.identifier_removal import remove_identifiers


def test_shared_example_removes_kinship_and_libyan_phone() -> None:
    sanitised, removed = remove_identifiers("بابا ديما يضغط عليا في قرايتي ورقمي 0912345678")
    assert sanitised == "[name] ديما يضغط عليا في قرايتي ورقمي [phone]"
    assert removed == [
        {"original": "بابا", "placeholder": "[name]"},
        {"original": "0912345678", "placeholder": "[phone]"},
    ]


def test_email_is_replaced() -> None:
    sanitised, removed = remove_identifiers("راسلني person@example.com بكرة")
    assert sanitised == "راسلني [email] بكرة"
    assert removed == [{"original": "person@example.com", "placeholder": "[email]"}]


def test_text_without_identifiers_stays_unchanged() -> None:
    text = "عندي امتحان بكرة"
    sanitised, removed = remove_identifiers(text)
    assert sanitised == text
    assert removed == []


def test_kinship_is_not_cut_out_of_a_longer_word() -> None:
    sanitised, removed = remove_identifiers("باباي جاب الخبر")
    assert sanitised == "باباي جاب الخبر"
    assert removed == []


def test_longer_kinship_word_wins() -> None:
    sanitised, removed = remove_identifiers("اخوي اتصل")
    assert sanitised == "[name] اتصل"
    assert removed == [{"original": "اخوي", "placeholder": "[name]"}]


def test_spaced_libyan_phone() -> None:
    sanitised, removed = remove_identifiers("رقمي 218 91 2345678")
    assert "[phone]" in sanitised
    assert removed[0]["original"] == "218 91 2345678"
    assert removed[0]["placeholder"] == "[phone]"


def test_empty_text() -> None:
    assert remove_identifiers("") == ("", [])
