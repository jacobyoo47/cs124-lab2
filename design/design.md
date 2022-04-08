## Design Decisions:
One large design change we made was regarding the data schema in Firestore. Based off of some feedback from the previous lab PR, we found it easier to have a top-level "Lists" collection, where each document within has a userId, listId, and listName, as well as a "Items" subcollection that contains the items within that list. Previously, we had a top-level "Users" collection with "Items" subcollection, but making changes to lists and having multiple lists was more cumbersome. This new structure provides more flexibility and also prepares us for next week's Authentication/Authorization lab where users can share lists with each other. It took some work to refactor our code to work with the new schema, but in the end, it was worth it.

REPLACE THIS PICTURE!!!!!!
![](final.png)

## Alternative Designs:
As mentioned above, one alternative design (technically our last lab's final design) we had was having the data schema with a top-level "Users" collection with "Items" subcollection. To implement multiple lists, each user would have to have multiple subcollections. With Firestore, there wasn't an easy way to query all subcollections of a document, so for each user document, we had an array that stored the names of its lists/subcollections. This meant that every time we wanted to edit a list name, we would have to change data in two places, the subcollection and the user document array. By changing over to the top-level "Lists" collection, we decoupled this dependency between two entities so we only had to change one place.

## User Testing:
For user testing, we again followed the guidelines stated in the readings.

User 1:

User 2:


## Challenges:


## Parts Of Design We Are Proud Of:
