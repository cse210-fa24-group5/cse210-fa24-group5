async function fetchCompletedProblems(username) {
    const apiUrl = "https://leetcode.com/graphql/";
    const query = `query getUserProfile($username: String!) {
    recentAcSubmissionList(username: $username) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
    }
}`;
    const problems = []
    const variables = { username };
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Error in response:", data.errors);
            return;
        }
        const user_recent = data.data;
        if (!user_recent) {
            console.error(`User ${username} not found for recent submissions.`);
            return;
        }
        const recentSubmissions = user_recent.recentAcSubmissionList || [];
        console.log(`Completed Problems by ${username}:`);
        recentSubmissions.forEach((submission) => {
            problems.push(fetchProblemDifficulty(submission.titleSlug));
            console.log(`Title: ${submission.title}`);
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
    }
    return problems
}


async function fetchProblemDifficulty(title) {
    const apiUrl = "https://leetcode.com/graphql/";
    const titleSlug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const query = `query getProblemDifficulty($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            title
            difficulty
        }
    }`;
    const variables = { titleSlug };
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Error in response:", data.errors);
            return;
        }
        const problem = data.data.question;
        if (problem) {
            return {title: problem.title , difficulty: problem.difficulty}
        } else {
            console.log(`Problem with title "${title}" not found.`);
        }
    } catch (error) {
        console.error("Error fetching problem difficulty:", error);
    }
}


const problemList = fetchCompletedProblems("cherylstanley28"); // Hard coded the username
console.log(problemList)
const container = document.querySelector('.container');
function addProblemButtons(problems) {
  problems.forEach(problem => {
    const button = document.createElement('button');
    button.classList.add('problem-button', problem.difficulty.toLowerCase());

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('problem-title');
    titleSpan.textContent = problem.title;

    const difficultySpan = document.createElement('span');
    difficultySpan.classList.add('difficulty');
    difficultySpan.textContent = problem.difficulty;

    button.appendChild(titleSpan);
    button.appendChild(difficultySpan);

    container.appendChild(button);
  });
}

addProblemButtons(problemList);
