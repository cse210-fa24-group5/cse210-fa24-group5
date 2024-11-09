Greenfield LeetCode Tracker Tool Extension

- Leetcode Timer Chrome extension (with GH / VS code integration of time permits)  
- Add problems to the ToDo List  
- Keep track of Streak of problems solved  
- Once timer ends it notifies you and then asks you if you want to continue. You can change the time

MVP:

Timer overlay \+ ToDo List

User Focused Stories

User Classes: Students or anyone who needs LC

Problem: It’s annoying to have to go back and forth between a physical timer when doing leetcode problems. It would be nice to have automatic tracking of how many LeetCode problems you do. It makes you disciplined and a stronger problem solver to have the timer in focus when solving the problems. This app also makes it easier to revisit problems that you want to practice again.

[https://github.com/NeserCode/Leetcode-Api](https://github.com/NeserCode/Leetcode-Api)

**User Stories:**  
	*As a **\<\>**, I want to **\<\>** so that I can **\<\>***

- As a software developer interview candidate I ensure I have practiced all the types of problems which will be asked in the interviews and am keeping track of the time spent solving them.  
- As a Computer Science student getting ready to interview, I want to avoid spending too much time practicing a single question so that I may get a larger breadth of knowledge to succeed in my interviews.  
- As a student I want to make sure I am using my available time efficiently and am solving enough LeetCode problems within my free time to remain competitive in the job market.  
- As a Computer Science student working on leetcode problems, I want to keep a list of leetcode problems that I want to work on later.   
- As someone who wants to review leetcode problems without going through all my submissions, I want to keep a list of problems I want to revisit, so that I could further polish my skills by redoing them. 

User 1:  
I am a graduate student trying to balance my time between classes and devote at least 30 minutes a day to solving Leetcode problems. I have a goal of solving 3 LeetCode problems a week, but am taking too much time to solve each problem. I also want to be able to easily revisit problems that I’ve already solved, see their difficulty level etc is really helpful for my learning.

- As a Computer Science student getting ready to interview, I want to   
    
  When working on LC problems, we can lose track of time and get stuck on a problem for 1-2 hours, which is rather inefficient because we probably should be looking at solutions before that. We want to have a timer that reminds us when we spent too much time on ourselves already.   
    
  When I do LC problems, I often browse through and find several problems I want to solve before actually working on them, but it is a little annoying to keep all those tabs open. I want to have a list of problems that I want to “work on later.”  
- As a Computer Science student working on leetcode problems, I want to keep a list of leetcode problems that I want to work on later.   
    
  A feature to keep track of lowest time solved and maintain a record. I.e. “You solved Problem X 2 min faster”

**Features derived from user stories:**  
Chrome extension that automatically fetches information needed when user opens a LC problem  
Must-haves:

* Timer based on difficulty of problem  
* Keep a to-do list of LC problems  
* Keep list of LC problems that the user “wants to revisit”  
* 

Nice to haves:

* Keep streaks of problems solved daily  
* Sort lists in different ways  
* Suggestions for what problems I can solve within the free time I have (I have 1 hr, I can solve this LC problem)  
* Scheduling \+ use tagging to get specific problems

**Risk Management:**  
Will LC API work? [https://github.com/NeserCode/Leetcode-Api](https://github.com/NeserCode/Leetcode-Api)

CI/CD Pipeline

- Unit Testing: Jest  
- Database: ?  
- Linting: Github / Github Actions

