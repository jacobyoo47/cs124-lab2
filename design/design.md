## Design Decisions:
For the design of our React To-Do List, we mainly took inspiration from the previous lab's static HTML/CSS To-Do List. However, this time, we utilized more of Professor Milburn's basic design principles.

Proximity:
As Professor Milburn stated, related elements should be grouped together. Thus, for the main functional buttons like the view filter and mass removal, we placed them together in a row above all of the list items. This way, users know that the main buttons they will need to press are at the top. We placed our add item button (plus icon) in a different place, at the bottom, because we believed this made more sense to the user. If a user wants to add an item, it would be appended to the list, so naturally they would look at the bottom to click the add button.

Alignment:
Regarding alignment, all elements should line up with something else. We made sure that the functional buttons (view filter and mass removal) were aligned horizontally. Additionally, all the list items are aligned vertically and their icons are also aligned. Prof. Milburn warned that text that is cented-aligned is hard to read in blocks becuase of different start points for each line, so we decided to left-align the text within the list item. We placed the add button in the center since it is a relatively small button that would look awkward if right or left aligned.

Repetition:
Repetition states that some aspect of the design should be repeated throughout the project. In our case, we repeated the color scheme. Our main colors are a dakr/light blue with secondary colors of pink and white. For our white list items, we had blue edit icons and pink delete icons. Furthermore, the style of the list item component was repeated thorughout, meaning every list item looks the same (except for their respective text descriptions). Additionally, we kept the same font and font sizes so that it looked organized/unified, except for the title which is bolded and in a bigger font because we want it to stick out.

Contrast:
Professor Milburn's point about contrast was that, if things are not the same, then they should be very different. We employed this within our color scheme. Originally we were thinking of having two similar shades of blue as our primary colors. However, it looked odd because of how similar they were and thus we changed to have a dark gradient blue title and buttons, light blue background, white items, and blue/pink icons. This contrast between the white icons and overall blue theme helps to distinguish the items from the background and buttons.

Color Psychology:
Although not a design principle, we also though about Professor Milburn's explanation of the effects of color on a user. Our main colors, blue and pink, give off "trustworthy, comforting, relaxed" (blue) and "playful, innocent, youthful" (pink). We believe these are great traits for a to-do list that is aiming to be modern and used mainly by college students.

![](final.png)

## Alternative Designs:

Our alternative designs are the same as in Lab 1. We came up with these designs individually, then came together to discuss the pros and cons of each. We obviously did not implement each in React, rather only implementing the final design in React after much planning and whiteboarding.

![](alternatives.png)

One aspect that we especially had to talk about was the way that users would edit/add items. Once a user clicks the plus button or edit icon, we were wondering the best way that would allow them to enter the text. One option was to have an input text box directly on the list item, but we found this to be a bit ugly. Instead, we went with a modal approach. Thus, a modal pops up that allows them to type their text and then once they save, the item is edited or added.

## User Testing:
For user testing, we followed several guidelines stated in the readings. We sat the user down and told them to say anything that came across their mind while using our to-do list. We reminded them that this was simply to improve our design and they should feel free to say anything or stop at any time. We also tried to get a wider variety of users. For example, one of our users is a CS major, another is a chemistry major, and another graduated already. We believe that a varying amount of technical background would serve to provide the most comprehensive feedback. Below is a recap of what each user had to say.

User 1:
This user started pressing the various buttons while stating out loud what they expected them to do. It was immediately clear that the plus button at the bottom allowed you to addd a new list item. The edit and delete icons were also very apparent, along with the checkbox for showing the status of the item. They then clicked through the show filter button and figured out that you could toggle which tasks are showing, based on completion status. Lastly, they said that the remove completed button was also intuitive. After playing with all of the functionality, they also commented that they liked the color scheme since it was lively and modern-feeling. This user also spotted a mistake, since we mistakenly left in "Text: " before the text of the item, which was used in testing. We quickly fixed this once this was found.

User 2:
This user took a slightly different approach to using our to-do list. Without touching any functionality, they looked at our interface and tried to state what each button or icon was supposed to do. As we hoped for, they were able to accurately describe every button/icon's functionality without any difficulty or hard thinking (i.e. the trash icon deletes the item and the plus button at the bottom adds a new item). This reaffirmed that our goal of having a simple, intuitive design was working.

User 3:
Our last user was more critical than our other users. Straight off the bat, they mentioned that the plus button at the bottom was not completely clear on its functionality. This conflicted with some of the other feedback we received, but we respect their comments and understand that it could be improved. They found the other buttons quite intuitive and enjoyed the simplicity of the interface. They also suggested several improvements in terms of functionality, which we would like to pursue in the future when we have more time. One was the ability to undo deletes. For example, after clicking the remove completed button, there should be a way to get back the items that were just deleted in case this was a mistake. Additionally, they suggested that there could be a way to add a description to the item, since often times you want an item title, then a larger description. This would require some larger changes in terms of code, but would be a valuable feature to users.


## Challenges:
Both of us have had a good amount of working with React, whether as side projects or in internships. Thus, the core concepts of React like state, props, etc. have been drilled into our brains. This made architecturing the app very straightforward. The most time-consuming part was CSS yet again, as creating the layout and accounting for things like text overflow were a bit annoying. However, we were able to reuse some parts of Lab 1's HTML/CSS.

## Parts Of Design We Are Proud Of:
We are proud of how we have more of a modern feel for our app. This effect is produced by our use of icons and rounded edges when possible for buttons and borders. The simplicity of the icons and buttons reduces clutter and makes the app more intuitive to users. We also employed some other techniques like box shadowing to draw user's attention to the important buttons like view filter and mass item removal.