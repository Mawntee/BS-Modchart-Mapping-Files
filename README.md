# Chief-Queef-Mapping-Files
Original files/scripts from the Chief Queef Beat Saber charts. 

"Chief Queef" was an alt account that I used to first learn notemods and effects in Beat Saber using Noodle Extensions.
Each chart really focuses on one main aspect/gimmick or a new feature that was added at the time. 

I still go back to these scripts as a reference for charts that I'm currently working on, so I figured I'd post them up here as well for others to pick apart and see how things are done. 

Before diving in, I highly recommend taking a second to watch my video going over all the different animation types in Noodle Extensions and what they do.
https://youtu.be/nMHaPJ8o-Jk
As well, you should have a brief look at the difference between the "Expert" and "ExpertPlus" difficulty files. 
Open them up side by side and just take a few minutes to notice any differences between the two, and try to take some guesses as to what each thing does.
It will make a lot of this stuff significantly easier to understand!


My Workflow:
1. Start with a vanilla map "Expert" difficulty in MMA2
2. Once charted, I will duplicate the difficulty to an "Expert Plus" difficulty
    - I will then add the requirements for "Chroma" and "Noodle Extensions" to the new Ex+ difficulty
3. I started originally with the "demo.js" file from the Noodle Extensions (now call "Heck") documentation. 
    - This file has been built up and personalized over time with functions I've made for all of these charts.
    - Many of these go un-used, and are only there for copy/pasta because It's nearly impossible to remember every little thing you can do with Heck.
4. 
    - In the JS file there is a section at the very top where I tell it what "input dif" to use, and where to export it to. (Expert -> Ex+)
    - Scrolling down lower you will find a bunch of functions that sit as copy/pasta or reference material.
    - Below those you will find a section titled: "//#region Do your dirty work here" 
     - This is where all the actual modchart goodies happen. (CTRL+F to this section) 
    - At the bottom are all the fuctions that handle exporting and sorting of the final output JSON file. 






DISCLAIMER: When I was making this, I was starting with literally ZERO experience with any kind of scripting or coding. 
This code is very rough, but it was very readable and simple for my smooth slippery brain to understand. 
If you know better practices, cool! Use them yourself!
Otherwise, everythything seen here might be "inefficient", but it works and is relatively easy to understand for someone with zero experience.  
