const {utils} = customJS;

async function getWeeklyJournal(date) {
    // function to get the weekly journal given the date of today
    // input: date in 'year-month-day ...' format
    // output: string, content of the weekly journal
    const weekNum = utils.getWeekNum(date);
    const yearNumber = date.split('-')[0];
    const journal_path = "Journal/" + yearNumber + '-W' + weekNum + ".md";
    const content = await dv.io.load(journal_path);
    
    return content;
}

async function getWeeklyGoal(content, pomoEmoji, checkEmoji) {
    // function to get the weekly goal from the weekly journal
    // input: string, content of the weekly journal
    // output: {goal_name: [goal_value, goal_type]}

    const content_parsed = utils.parseMarkdown(content, 2);
    const goal_section = content_parsed.find(section => section.header.includes("Goal"));
    const goal_lst = goal_section.content.replace(/- /g, '').split('\n');
    let result = {};
    goal_lst.forEach((goal) => {
        const goal_item = goal.split(': ');
        const goal_name = goal_item[0].replace('[[', '').replace(']]', '');
        const goal_content = goal_item[1];
        if (goal_content.includes(pomoEmoji)) {
            const goal_value = parseFloat(goal_content.replace(pomoEmoji, '').replace(' ', ''));
            result[goal_name] = [goal_value, "pomo"];
        } else if (goal_content.includes(checkEmoji)) {
            const goal_value = parseFloat(goal_content.replace(checkEmoji, '').replace(' ', ''));
            result[goal_name] = [goal_value, "check"];
        } else {
            throw new Error("goal value is not in the correct format");
        }
    });
    return result;
}

async function recordProgress(weekNum, pomoEmoji, checkEmoji) {
    const weekdates = utils.getWeekDates(weekNum);
    async function processJournalContent(date) {
    try {
        const content = await dv.io.load("Journal/" + date + ".md");
        // skip if content is null or undefined
        if (content === null || content === undefined) {
            return {};
        }
        return content.split('\n').reduce((acc, line) => {
            if (line.includes(pomoEmoji) || line.includes(checkEmoji)) {
                const line_tags = utils.extractTags(line);
                line_tags.forEach((tag) => {
                    acc[tag] = (acc[tag] || 0) + 1;
                });
            }
            return acc;
        }, {});
    } catch (error) {
        console.error("Error loading journal file for date:", date, error);
        return {};
    }
}
    const promises = weekdates.map(date => processJournalContent(date));
    const results = await Promise.all(promises);
    return results.reduce((acc, curr) => {
        Object.entries(curr).forEach(([tag, count]) => {
            acc[tag] = (acc[tag] || 0) + count;
        });
        return acc;
    }, {});
}



// function to compare the progress with the weekly goal
async function compareProgressWithGoal(progress, goal, tag_dict_file="Hashtag-Project dictionary.md") {
    // input: progress: {tag: count}, goal: {tag: [count, type]}
    // output: {tag: [count, goal_count, type, progress_percentage]}
    console.log("progress: ")
    console.log(progress);
    console.log("goal: ")
    console.log(goal);
    const result = {};
    const progress_converted = {};
    const tag_dict = JSON.parse(await dv.io.load(tag_dict_file));
    console.log("tag_dict: ")
    console.log(tag_dict);
    Object.entries(progress).forEach(([tag, count]) => {
        if (tag_dict[tag]) {
            if (progress_converted[tag_dict[tag]]) {
                progress_converted[tag_dict[tag]] += count;
            } else {
                progress_converted[tag_dict[tag]] = count;
            }
        } else {
            // raise an error if the tag is not in the dictionary
            throw new Error("tag " + tag + " is not in the dictionary");
        }
    });
    Object.entries(goal).forEach(([tag, [goal_count, type]]) => {
        if (progress_converted[tag]) {
            result[tag] = [progress_converted[tag], goal_count];
        } else {
            result[tag] = [0, goal_count];
        }
    });
    return result;
}

async function plotProgressBar(compare_result) {
    // input: {tag1: [progress, goal], tag2: [progress, goal], ...}
    // output: html string
    console.log("compare_result: ")
    console.log(compare_result);
    const entries = Object.entries(compare_result);
    for (const [tag, [progress, goal]] of entries) {
        console.log("tag: " + tag + ", progress: " + progress + ", goal: " + goal)
        let html = utils.progressBarHtml(progress.toString(), goal.toString(), 80);
        html = `<div style="display: flex; align-items: center;">
            <div style="flex: 1; margin-right: 20px;">
                ${tag}
            </div>
            ${html}
        </div>`
        await dv.span(html); // Await each asynchronous call
        await dv.span(`<br>`);
    }
}

const pomoEmoji = "🍅";
const checkEmoji = "✅";
const weekNum = utils.getWeekNum(input.date);
console.log("weekNum: " + weekNum)
const content = await getWeeklyJournal(input.date);
const goal = await getWeeklyGoal(content, pomoEmoji, checkEmoji);

const progress = await recordProgress(parseInt(weekNum), pomoEmoji, checkEmoji);
const result = await compareProgressWithGoal(progress, goal);
await plotProgressBar(result);