$file = 'C:\Users\KIIT0001\Desktop\HACK\frontend\specialist-routing.html'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# 1. Replace the chat-doc-avatar div (which has initials) with doctor.png image
$oldAvatar = @'
<div class="chat-doc-avatar" id="chatDocAvatar">
'@
$newAvatar = @'
<div class="chat-doc-avatar" id="chatDocAvatar" style="background:none;border:none;overflow:hidden;padding:0;">
<img src="assets/doctor.png" alt="Doctor" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">
'@
$content = $content.Replace($oldAvatar, $newAvatar)

# 2. Replace the MOCK_FLOW with extended version (6-7 more follow-up steps)
$oldFlow = @'
    const MOCK_FLOW = [
        {
            q: "To provide the best context for the specialist, could you describe the primary sensation you're feeling?",
            opts: ["Sharp/Stabbing pain", "Dull/Persistent ache", "Tingling/Numbness", "General discomfort"],
            resp: "I've logged that sensation. Specialists often use pain quality as a primary diagnostic indicator."
        },
        {
            q: "On a scale of 1-10, how intense is this feeling currently?",
            opts: ["Mild (1-3)", "Moderate (4-6)", "Severe (7-8)", "Intense (9-10)"],
            resp: "Thank you. Your pain scale has been recorded in your preliminary report for immediate review."
        },
        {
            q: "How long has this been occurring?",
            opts: ["Just a few hours", "2-3 days", "Over a week", "Intermittent / Chronic"],
            resp: "Duration is a key metric. I've noted this as a " + (flowIndex === 2 ? "timeline detail" : "chronicity marker") + "."
        },
        {
            q: "Are there any specific triggers that make it worse?",
            opts: ["Physical activity", "Certain foods/drinks", "Stress/Anxiety", "Worse at night"],
            resp: "Noted. Identifying triggers is crucial for differential diagnosis in this specialty."
        },
        {
            q: "Have you tried any home remedies or over-the-counter medications yet?",
            opts: ["Ibuprofen / Aspirin", "Heat / Ice pack", "Rest / Elevation", "Nothing yet"],
            resp: "It's good to know what you've tried. I'll make sure the specialist knows the current management status."
        },
        {
            q: "Is there anything else crucial you'd like the doctor to know immediately?",
            opts: ["Recent travel", "Family history", "Allergies", "No, that's all"],
            resp: "Perfect. I've compiled all these details into a structured summary for your consultation."
        },
    ];
'@

$newFlow = @'
    const MOCK_FLOW = [
        {
            q: "To provide the best context for the specialist, could you describe the primary sensation you're feeling?",
            opts: ["Sharp/Stabbing pain", "Dull/Persistent ache", "Tingling/Numbness", "General discomfort"],
            resp: "I've logged that sensation. Specialists often use pain quality as a primary diagnostic indicator."
        },
        {
            q: "On a scale of 1-10, how intense is this feeling currently?",
            opts: ["Mild (1-3)", "Moderate (4-6)", "Severe (7-8)", "Intense (9-10)"],
            resp: "Thank you. Your pain scale has been recorded in your preliminary report for immediate review."
        },
        {
            q: "How long has this been occurring?",
            opts: ["Just a few hours", "2-3 days", "Over a week", "Intermittent / Chronic"],
            resp: "Duration is a key metric. I've noted this as a chronicity marker in your profile."
        },
        {
            q: "Are there any specific triggers that make it worse?",
            opts: ["Physical activity", "Certain foods/drinks", "Stress/Anxiety", "Worse at night"],
            resp: "Noted. Identifying triggers is crucial for differential diagnosis in this specialty."
        },
        {
            q: "Have you tried any home remedies or over-the-counter medications yet?",
            opts: ["Ibuprofen / Aspirin", "Heat / Ice pack", "Rest / Elevation", "Nothing yet"],
            resp: "Good to know. I'll make sure the specialist is aware of your current management approach."
        },
        {
            q: "Have you experienced this kind of issue before, or is this the first time?",
            opts: ["First time ever", "Recurring issue", "Had something similar years ago", "Unsure"],
            resp: "That context helps the doctor understand whether this is acute or part of a pattern. Logged."
        },
        {
            q: "Are you currently on any regular medications or have any known allergies?",
            opts: ["Yes, on medication", "Allergies only", "Both medication & allergies", "None"],
            resp: "Excellent — drug history and allergies are critical for safe prescribing. I've noted this for the doctor."
        },
        {
            q: "On a general note, how has your sleep and energy level been lately?",
            opts: ["Normal / Fine", "Feeling fatigued", "Poor sleep, low energy", "Very exhausted"],
            resp: "Overall wellness indicators help the specialist spot underlying patterns. All captured."
        },
        {
            q: "Is there anything else crucial you'd like the doctor to know immediately?",
            opts: ["Recent travel", "Family history", "Allergies", "No, that\u2019s all"],
            resp: "Perfect. I've compiled all these details into a structured summary for your consultation."
        },
    ];
'@

$content = $content.Replace($oldFlow, $newFlow)

# Write back as UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
Write-Host "Done! Avatar replaced with doctor.png and 3 extra follow-up questions added."
