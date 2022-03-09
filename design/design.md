## Design Decisions:
The largest design decision made was regarding how to store our data (the structure of the firestore schema). We know that we want a user to be able to grab all of their to-do list items. We noticed that in future labs, we have to have the ability to support individual users having their own lists separate from others (instead of a singular global list shared amongst all users). Thus, we preemptively prepared for this case. Our structure is as follows: we have a Users collection and for each user document, we have an Items subcollection. For now, a user document just consists of a name property and the default global user has a name of "user" with id "User". Within the Items subcollection, there are item documents that have the properties id, text, completed, priority, and created. Thus, the path to the global list of item documents would look something like "Users/User/Items".

Another deisgn decision we made in this iteration was how to display the priority of a list item to the user. There were several options we considered, but we went with having a small color tab on the left end of the item to showcase the priority. We used color pscyhology/convention (green = good/low priority, red = bad/high priority) for the various priority colors while also making sure that these small color indicators did not mix up our color scheme by taking up too much space.

A final design decision we made in this iteration was how we would allow the user to choose the order of displayed items. We added a dropdown button next to the show and remove buttons below the title so that users could select the sorting order. Users can now sort by priority ascending/descending or dat created ascending/descending. To maintain consistency, we also changed the show button to become a dropdown (before it was a toggle so users would have to click it multiple times to get to the one they want). Besides consistency, we also received user feedback about changing it to a dropdown instead of a toggle for easier use.

CHANGE THIS PIC ONCE FINISHED
![](final.png)

## Alternative Designs:
One alternative design was to have item background color changes for the priority, instead of our current design of having a small color tab on the side of the item. However, we had a difficult time finding colors suitable for this. We believe the white background of the item fits the light blue background of the app background. The small priority tab color is enough of an indicator that does not mess with the color scheme. We found that changing the entire background of the item made the app look aesthetically displeasing and scrambled the color scheme.

## User Testing:
User 1:


## Challenges:
One challenge was getting firebase hosting to work properly. Even after following all the writeup instructions, there seemed to be an error that caused a white page to be displayed instead of our app. However, after comparing with some other students in class, we were able to figure out the issue was with the "homepage" attribute in the package.json file. After removing it, our app was correctly hosted and displayed.

Another challenge was figuring out which functions to use regarding firebase and firerstore (i.e. how to grab all the documents we need, how to filter out certain documents, how to edit specific documents, etc.). However, we were able to consult the documentation and also the in-class work on firestore to successfully implement the necessary firestore functionalities.

## Parts Of Design We Are Proud Of:
One part of the design we are proud of is our priority color tab indicator to show the priority level of a list item. The small indicator on the side of the item did not detract from our blue color scheme while still conveying the necessary information.