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
        return problem
            ? {
                  questionId: problem.questionId,
                  title: problem.title,
                  difficulty: problem.difficulty,
              }
            : null;
    } catch (error) {
        console.error("Error fetching problem details:", error);
        return null;
    }
}

function addProblemButtons(problems, container) {
    container.innerHTML = ""; // Clear previous content
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
        difficultySpan.textContent = ` ${problem.difficulty}. `;

        button.appendChild(numberSpan);
        button.appendChild(titleSpan);
        button.appendChild(difficultySpan);

        container.appendChild(button);
    });
}

async function main() {
    const fetchButton = document.querySelector("#fetchButton");
    const usernameInput = document.querySelector("#usernameInput");
    const container = document.querySelector(".container");

    fetchButton.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Please enter a username.");
            return;
        }

        const problems = await fetchCompletedProblems(username);
        if (problems.length === 0) {
            container.innerHTML = `<p>No completed problems found for "${username}".</p>`;
        } else {
            addProblemButtons(problems, container);
        }
    });
}

main();
