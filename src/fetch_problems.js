async function fetchCompletedProblems(username) {
    const apiUrl = "http://localhost:4000/leetcode";

    const query = `query getUserProfile($username: String!) {
        recentAcSubmissionList(username: $username) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
        }
    }`;
    const variables = { username };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Error in response:", data.errors);
            return [];
        }

        const user_recent = data.data;
        if (!user_recent) {
            console.error(`User ${username} not found for recent submissions.`);
            return [];
        }

        const recentSubmissions = user_recent.recentAcSubmissionList || [];
        console.log(`Completed Problems by ${username}:`);

        const problemsWithDetails = await Promise.all(
            recentSubmissions.map(async (submission) => {
                const details = await fetchProblemDetails(submission.titleSlug);
                return {
                    title: submission.title,
                    difficulty: details?.difficulty || "Unknown",
                    number: details?.questionId || "N/A",
                };
            })
        );

        return problemsWithDetails;
    } catch (error) {
        console.error("Error fetching problems:", error);
        return [];
    }
}

async function fetchProblemDetails(titleSlug) {
    const apiUrl = "http://localhost:4000/leetcode";

    const query = `query getProblemDetails($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionId
            title
            difficulty
        }
    }`;
    const variables = { titleSlug };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Error in response:", data.errors);
            return null;
        }

        const problem = data.data.question;
        if (problem) {
            return {
                questionId: problem.questionId,
                title: problem.title,
                difficulty: problem.difficulty,
            };
        } else {
            console.log(`Problem with titleSlug "${titleSlug}" not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching problem details:", error);
        return null;
    }
}

function addProblemButtons(problems, container) {
    problems.forEach((problem) => {
        const button = document.createElement("button");
        button.classList.add("problem-button", problem.difficulty.toLowerCase());

        const numberSpan = document.createElement("span");
        numberSpan.classList.add("problem-number");
        numberSpan.textContent = `${problem.number}. `;

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("problem-title");
        titleSpan.textContent = problem.title;

        const difficultySpan = document.createElement("span");
        difficultySpan.classList.add("difficulty");
        difficultySpan.textContent = ` ${problem.difficulty}. `;;

        button.appendChild(numberSpan);
        button.appendChild(titleSpan);
        button.appendChild(difficultySpan);

        container.appendChild(button);
    });
}

async function main() {
    const username = "cherylstanley28"; // Hard-coded username
    const problems = await fetchCompletedProblems(username);

    const container = document.querySelector(".container");
    if (!container) {
        console.error("Container element not found.");
        return;
    }

    addProblemButtons(problems, container);
}

main();
