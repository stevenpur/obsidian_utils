// This is for the dashborad view chart for the pomodoro journal

const {utils} = customJS;

function pushDatasetsToChart(dataset, chart) {
    // Check if data structure is as expected
    if (Array.isArray(chart?.data?.datasets)) {
        chart.data.datasets.push(dataset);
    } else {
        // Throw an error if the structure is not as expected
        throw new Error("data is not structured as expected");
    }
}

function pushLabelsToChart(newLabel, data) {
    // Check if data structure is as expected
    if (Array.isArray(data?.data?.labels)) {
        data.data.labels.push(newLabel);
    } else {
        // Throw an error if the structure is not as expected
        throw new Error("data is not structured as expected");
    }
}

function initBarChartData() {
    const ChartData = {
        type: "bar",
        data: {
            labels: [],
            datasets: []
        }
    };
    return ChartData;
}


function getChartLabels(chartData) {
    return chartData.data.labels;
}

function restructureDateTags(dateTag) {
    // restructure the data to be used in chart
    // input data: {date: {tag: count}}
    // output data: {tag: [count_date1, count_date2, ...]}
    const restructedData = {};
    // get all tags
    const allTags = utils.unique(Object.values(dateTag).map(obj => Object.keys(obj)).flat());
    console.log("allTags: ");
    console.log(allTags);
    const dates = Object.keys(dateTag);
    allTags.forEach(tag => {
        restructedData[tag] = dates.map(date => dateTag[date][tag] || 0);
    });
    return restructedData;
}

async function getBarChartData() {
    const pomoEmoji = "🍅";
    let pomoData = {}
    let tagCounts = {};
    let chartData = initBarChartData();
    console.log("starting...");
    try {
        const pages = await dv.pages('"Journal"');
        // filter pages by file being named by "year-month-day weekday"
        const daily_pages = pages.filter((page) => {
            return page.file.name.match(/\d{4}-\d{2}-\d{2} \w+/)
        }); 
        console.log("daily_pages: ");
        console.log(daily_pages);
        for (const page of daily_pages) {
            console.log("loading page " + page.file.name + "...");
            const content = await dv.io.load(page.file.path);
            console.log("page loaded");
            
            console.log("pushing labels to chart...");
            pushLabelsToChart(page.file.name, chartData);
            console.log("content:");
            console.log(content);
            let pomoLines = utils.getEmojiLines(content, pomoEmoji);
            console.log("pomoLines.length: " + pomoLines.length);
            pomoData[page.file.name] = {
                total: pomoLines.length,
            }
            const tags = utils.extractTags(content);
            const tagFrequency = utils.getFrequency(tags);
            utils.unique(tags).forEach(tag => {
                    pomoData[page.file.name][tag] = tagFrequency[tag];
            });
        }

        const colorPalette = utils.setColorPalette();
        let colorIndex = 0;
        console.log("start to push data to chart data...");
        console.log(tagCounts);
        // restructure the data to be used in chart
        console.log("pomoData: ");
        console.log(pomoData);
        pomoData = restructureDateTags(pomoData);
        console.log("restructured pomoData: ");
        console.log(pomoData);
        Object.keys(pomoData).forEach((tag) => {
            console.log("tag: " + tag)
            const dataset = {
                label: tag,
                data: pomoData[tag],
                backgroundColor: colorPalette[colorIndex % colorPalette.length]
            };
            console.log(dataset)
            pushDatasetsToChart(dataset, chartData);
            colorIndex++;
        });
        return chartData;

    } catch (error) {
        console.error("An error occurred: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

await getBarChartData().then((chartData) => {
    input.win.renderChart(chartData, input.el);
}
);
