class utils{
    getEmojiLines(content, emoji) {
        // get lines that contain the target emoji
        console.log("start to get emoji lines...")
        return content.split("\n").filter(line => line.includes(emoji));
    }
    
    extractTags(content) {
        // expect content to be a string
        console.log("start to extract tags...")
        const tags = content.match(/#[\w-]+/g) || [];
        console.log("extract done");
        return tags;
    }
    
    getFrequency(array) {
        return array.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
    }
    
    union(array1, array2) {
        return ((array1.concat(array2)));
    }
    
    unique(array) {
        return [...new Set(array)];
    }
    
    setColorPalette() {
        const colorPalette = [
            '#FF6384', // Pinkish Red
            '#36A2EB', // Sky Blue
            '#FFCE56', // Yellow
            '#4BC0C0', // Turquoise
            '#9966FF', // Lavender
            '#FF9F40', // Orange
            '#4D5360', // Dark Grey
            '#EA6B66', // Coral
            '#7ACBEE', // Light Blue
            '#C9CB74', // Olive Green
            // Add more colors as needed
        ];
        return colorPalette;
    }

    getTodaysDateStr() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
    
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekday = weekdays[today.getDay()]; // getDay() returns 0 (Sunday) through 6 (Saturday)
    
        return `${year}-${month}-${day} ${weekday}`;
    }
    
    getWeekDates(week_num) {
        const dates = [];
        // Get the first day of the year
        const yearStart = new Date(new Date().getFullYear(), 0, 1);

        // Calculate the number of days from the start of the year to the requested week
        const dayOffset = (week_num - 1) * 7 - (yearStart.getDay() || 7) + 1;
    
        // Set the start date to the first day of the given week
        const startDate = new Date(yearStart.setDate(yearStart.getDate() + dayOffset));
    
        // Get all days of the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
    
            // Format date as 'YYYY-MM-DD'
            const formattedDate = date.toISOString().split('T')[0];
    
            // Get three-letter weekday abbreviation
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    
            // Combine formatted date with weekday
            const formattedDateWithWeekday = `${formattedDate} ${weekday}`;
    
            dates.push(formattedDateWithWeekday);
        }
    
        console.log(dates);
        return dates;
    }

    getWeekNum(dateString) {
        // Extracting the date part and converting it to a Date object
        const dateParts = dateString.split(' ')[0].split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
        // Setting the date to the first day of the year
        const yearStart = new Date(date.getFullYear(), 0, 1);
    
        // Calculating the difference in days from the start of the year
        const diffInDays = Math.floor((date - yearStart) / 86400000);
    
        // Calculating the day number of the year start
        const dayOfYearStart = yearStart.getDay() || 7; // If January 1st is a Sunday, set it to 7
    
        // Adjusting the first week to start on Monday
        const adjustedDiff = diffInDays + dayOfYearStart;
    
        // Calculating the week number
        const weekNo = Math.ceil(adjustedDiff / 7);
    
        // Returning the week number as a two-digit string
        return weekNo < 10 ? '0' + weekNo.toString() : weekNo.toString();
    }    

    parseMarkdown(markdown, level = 1) {
        const lines = markdown.split('\n');
        const result = [];
        let currentHeader = null;
        let currentContent = [];
    
        lines.forEach(line => {
            if (line.trim() === '') return; // Skip empty lines
            const headerMatch = line.match(new RegExp(`^#{${level}}\\s+(.*)`));
            if (headerMatch) {
                if (currentHeader) {
                    result.push({
                        header: currentHeader,
                        content: currentContent.join('\n').trim(),
                        subSections: this.parseMarkdown(currentContent.join('\n'), level + 1)
                    });
                }
                currentHeader = headerMatch[1];
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        });
    
        if (currentHeader) {
            result.push({
                header: currentHeader,
                content: currentContent.join('\n').trim(),
                subSections: this.parseMarkdown(currentContent.join('\n'), level + 1)
            });
        }
        return result.filter(section => section.header); // Filter out empty headers
    }

    progressBarHtml(value, max, width, background_color = "#ddd", progress_color = "#4CAF50") {
        // Create a progress bar html code, rounded to the nearest percentage
        console.log("value: " + value);
        console.log("max: " + max);
        const percentage = Math.round((value / max) * 100);
        const percentage_str = percentage.toString() + "%";
        const total_width = parseInt(width).toString() + "%";
        const progress_width = Math.round(percentage/100 * parseInt(width)).toString() + "%";
        console.log("percentage: " + percentage)
        const html_str = `<div style="width: ${total_width}; background-color: ${background_color};"> <div style="width: ${progress_width}; height: 30px; background-color: ${progress_color}; text-align: center; line-height: 30px; color: white;"> ${percentage_str} </div> </div>`
        return html_str;
    }
        
}

