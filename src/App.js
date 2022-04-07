import './App.css';
import { useState, useEffect } from 'react';
import { FaPlus, FaPlusCircle, FaUndo, FaEdit, FaTrashAlt, FaClipboardList } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Dropdown from './Dropdown';
import ListItem from './ListItem';
import Modal from './Modal';
import AddEditItemModal from './AddEditItemModal';
import AddEditListModal from './AddEditListModal';
import { PriorityToNumber } from './ListItem';
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, query, collection, doc, setDoc, updateDoc, deleteDoc, orderBy, where, serverTimestamp, writeBatch } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { generateUniqueID } from "web-vitals/dist/modules/lib/generateUniqueID";

const firebaseConfig = {
    apiKey: "AIzaSyDTdxmHJT6utYagkotNRpMLF-EmRhcSYWw",
    authDomain: "cs124-lab3-d4101.firebaseapp.com",
    projectId: "cs124-lab3-d4101",
    storageBucket: "cs124-lab3-d4101.appspot.com",
    messagingSenderId: "78965801208",
    appId: "1:78965801208:web:e72bd3c413b6b54b10bb0d"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const collectionName = "Lists";
const subcollectionName = "Items";
// Eventually will change once we add functionality for multiple users
// For now, have one global user for all list items
const userId = "user";

// Enum for mode of which list items to show
const ShowState = {
    All: 'All',
    Completed: 'Completed',
    Uncompleted: 'Uncompleted',
}
const ShowArr = [
    'All',
    'Completed',
    'Uncompleted',
]

// Enum for sort condition
// First element is field, second element is ascending/descending
const SortBy = {
    Created_ASC: "Created_ASC",
    Created_DESC: "Created_DESC",
    Text_ASC: "Text_ASC",
    Text_DESC: "Text_DESC",
    Priority_ASC: "Priority_ASC",
    Priority_DESC: "Priority_DESC",
}
const SortByArr = [
    "Created Ascending",
    "Created Descending",
    "Text Ascending",
    "Text Descending",
    "Priority Ascending",
    "Priority Descending",
]
// Need these to convert between the dropdown options display string and the actual enum
const SortStrToEnum = {
    "Created Ascending": "Created_ASC",
    "Created Descending": "Created_DESC",
    "Text Ascending": "Text_ASC",
    "Text Descending": "Text_DESC",
    "Priority Ascending": "Priority_ASC",
    "Priority Descending": "Priority_DESC",
}
const SortEnumToStr = {
    "Created_ASC": "Created Ascending",
    "Created_DESC": "Created Descending",
    "Text_ASC": "Text Ascending",
    "Text_DESC": "Text Descending",
    "Priority_ASC": "Priority Ascending",
    "Priority_DESC": "Priority Descending",
}

// Enums for undo types (item, list) and operations (add, edit, delete)
const UndoType = {
    Item: "Item",
    List: "List",
}
const UndoOp = {
    Add: "Add",
    Edit: "Edit",
    Delete: "Delete",
}

function App() {
    // Sort order for list items
    const [sortState, setSortState] = useState(SortBy.Created_ASC);
    const sortArr = sortState.split("_");
    // Extract field and asc/desc order
    const sortField = sortArr[0].toLowerCase();
    const sortOrder = sortArr[1].toLowerCase();

    // Firestore query states
    const listsQuery = query(collection(db, collectionName), where("userId", "==", userId));
    const [listsData, listsLoading, listsError] = useCollectionData(listsQuery);

    // Need listId to query tasks of that list, but want to display listName
    const [listInfo, setListInfo] = useState({
        listId: null,
        listInfo: null,
    });
    const listNameToId = (name) => {
        for (const list of listsData) {
            if (list.listName === name) {
                return list.listId;
            }
        }
    }
    // Set listId and listName to first list after lists data has loaded
    useEffect(() => {
        if (!listInfo.listId) {
            setListInfo({
                listId: listsData ? listsData[0].listId : null,
                listName: listsData ? listsData[0].listName : null,
            });
        }
    }, [listsData, listInfo.listId]);
    const firstDifferentList = (list) => {
        for (const list2 of listsData) {
            if (list.listId !== list2.listId) {
                return {
                    listId: list2.listId,
                    listName: list2.listName,
                };
            }
        }
    }

    const itemsQuery = query(collection(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`), orderBy(sortField, sortOrder));
    const [itemsData, itemsLoading, itemsError] = useCollectionData(itemsQuery);

    // Allow user to undo recent add/edit/delete operations
    const [undoStack, setUndoStack] = useState([]);

    const pushUndoStack = (undoOp) => {
        setUndoStack(undoStack.concat([undoOp]));
    }

    // Which items are shown to the user
    const [showState, setShowState] = useState(ShowState.All);
    const shouldShow = (item) => {
        if (showState === ShowState.All) {
            return true;
        } else if (showState === ShowState.Completed) {
            return item.completed;
        } else {
            return !item.completed;
        }
    }

    // Hidden modals for adding/editing/deleting list items
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);

    // Hidden modals for adding/editing/deleting lists
    const [showAddListModal, setShowAddListModal] = useState(false);
    const [showEditListModal, setShowEditListModal] = useState(false);
    const [showDeleteListModal, setShowDeleteListModal] = useState(false);

    // Add item
    const onAddItem = (text, priority) => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Add,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            newListId: null,
            newListName: null,
            data: itemsData,
        });

        const id = generateUniqueID();
        setDoc(doc(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`, id), {
            id: id,
            text: text,
            completed: false,
            priority: priority,
            created: serverTimestamp(),
        });
    }

    // Edit item
    const onEditItem = (id, text, completed, priority) => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Edit,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            newListId: null,
            newListName: null,
            data: itemsData
        });

        updateDoc(doc(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`, id), {
           text: text,
           completed: completed,
           priority: priority,
        });
    }

    // Delete item by id
    const onDeleteItem = (id) => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Delete,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            newListId: null,
            newListName: null,
            data: itemsData
        });

        deleteDoc(doc(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`, id));
    }

    // Remove completed items
    const onRemoveCompleted = () => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Delete,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            newListId: null,
            newListName: null,
            data: itemsData
        });

        const batch = writeBatch(db);

        itemsData.forEach((item) => {
            if (item.completed) {
                batch.delete(doc(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`, item.id));
            }
        });

        batch.commit();
    }

    // Add list
    const onAddList = (name) => {
        const id = generateUniqueID();

        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Add,
            oldListId: null,
            oldListName: null,
            newListId: id,
            newList: name,
            data: [],
        });

        setDoc(doc(db, collectionName, id), {
            listId: id,
            listName: name,
            userId: userId,
        });

        // Update state to be on newly added list
        setListInfo({
            listName: name,
            listId: id,
        });
    }

    // Edit list name
    const onEditList = (oldId, oldName, newName) => {
        const id = generateUniqueID();

        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Edit,
            oldListId: oldId,
            oldListName: oldName,
            newListId: id,
            newListName: newName,
            data: itemsData,
        });

        const batch = writeBatch(db);

        // Delete old list
        batch.delete(doc(db, collectionName, oldId));

        // Add new list
        batch.set(doc(db, collectionName, id), {
            listId: id,
            listName: newName,
            userId: userId,
        });

        // Add back all items under new list name
        itemsData.forEach((item) => {
            batch.set(doc(db, `${collectionName}/${id}/${subcollectionName}`, item.id), {
               id: item.id,
               text: item.text,
               completed: item.completed,
               priority: item.priority,
               created: item.created,
            });
        });

        batch.commit();

        // Update state to be on newly edited list
        setListInfo({
            listName: newName,
            listId: id,
        });
    }

    // Delete list
    const onDeleteList = (id, name) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Delete,
            oldListId: id,
            oldListName: name,
            newListId: null,
            newListName: null,
            data: itemsData,
        });

        deleteDoc(doc(db, collectionName, id));

        // Update state since current subcollection list no longer exists
        const newListInfo = firstDifferentList({
            listId: id,
            listName: name,
        })
        setListInfo(newListInfo);
    }

    // Undo operation so data is brought to previous state
    const onUndo = () => {
        const newStack = [...undoStack];
        const undo = newStack.pop();
        const batch = writeBatch(db);

        if (undo.type === UndoType.Item) { // Undo operation on item(s) within a list
            const q = query(collection(db, `${collectionName}/${undo.oldListId}/${subcollectionName}`));
            getDocs(q).then(res => {
                // Erase all current items from oldList
                res.docs.forEach((item) => {
                    batch.delete(doc(db, `${collectionName}/${undo.oldListId}/${subcollectionName}`, item.id));
                });

                // Add all items from data in back of undoStack
                undo.data.forEach((item) => {
                    batch.set(doc(db, `${collectionName}/${undo.oldListId}/${subcollectionName}`, item.id), {
                        id: item.id,
                        text: item.text,
                        completed: item.completed,
                        priority: item.priority,
                        created: item.created,
                    });
                });

                batch.commit();

                setListInfo({
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                });
            })
        } else { // Undo operation on a list
            if (undo.op === UndoOp.Add) {
                // Delete list
                batch.delete(doc(db, collectionName, undo.newListId));

                // Update state since current subcollection list no longer exists
                const newListInfo = firstDifferentList({
                    listId: undo.newListId,
                    listName: undo.newListName,
                })
                setListInfo(newListInfo);
            } else if (undo.op === UndoOp.Delete) {
                // Add back list
                batch.set(doc(db, collectionName, undo.oldListId), {
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                    userId: userId,
                });

                // Add back all items under new list name
                itemsData.forEach((item) => {
                    batch.set(doc(db, `${collectionName}/${undo.oldListId}/${subcollectionName}`, item.id), {
                        id: item.id,
                        text: item.text,
                        completed: item.completed,
                        priority: item.priority,
                        created: item.created,
                    });
                });

                setListInfo({
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                });
            } else {
                // Delete new list
                batch.delete(doc(db, collectionName, undo.newListId));

                // Add back old list
                batch.set(doc(db, collectionName, undo.oldListId), {
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                    userId: userId,
                });

                // Add back all items under old list name
                undo.data.forEach((item) => {
                    batch.set(doc(db, `${collectionName}/${undo.oldListId}/${subcollectionName}`, item.id), {
                        id: item.id,
                        text: item.text,
                        completed: item.completed,
                        priority: item.priority,
                        created: item.created,
                    });
                });

                setListInfo({
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                });
            }

            batch.commit();
        }


        // Update the undoStack
        setUndoStack(newStack);
    }

    return (
        <div className="App">
            {(listsLoading || itemsLoading) && <div className="loading-spinner"></div>}
            {(listsError || itemsError) && <h1 className="empty-placeholder">Error occurred while trying to fetch data. Please try again later.</h1>}
            {!listsLoading && !itemsLoading && !listsError && !itemsError &&
                <>
                    {/* Top title bar with list changing buttons/dropdown */}
                    <div className="todo-text todo-title">
                        <div className="todo-list-dropdown-container">
                            <div className="todo-list-dropdown">
                                {/* To-Do: CHANGE ID TO NAME MAPPING */}
                                <Dropdown
                                    menuLabel="To-Do:"
                                    onSelectItem={(val) => {
                                        setListInfo({
                                            listId: listNameToId(val),
                                            listName: val,
                                        });
                                    }}
                                    menuState={listInfo.listName}
                                    options={listsData.map(list => list.listName)}
                                    menuName="Lists"
                                />
                            </div>
                        </div>
                        <div className="todo-list-dropdown-buttons-container">
                            <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-add" aria-label="add list" onClick={() => {
                                setShowAddListModal(true);
                            }}>
                                <FaPlus />
                                <IconContext.Provider value={{ size: '25px' }}>
                                    <FaClipboardList />
                                </IconContext.Provider>
                            </button>
                            <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-edit" aria-label={`edit list name of list named ${listInfo.listName}`} onClick={() => {
                                setShowEditListModal(true);
                            }}>
                                <IconContext.Provider value={{ size: '27px' }}>
                                    <FaEdit />
                                </IconContext.Provider>
                            </button>
<<<<<<< HEAD
                            {userData.lists.length > 1 &&
                                <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-trash" aria-label={`delete list named ${subcollectionName}`} onClick={() => {
=======
                            {listsData.length > 1 &&
                                <button className="todo-list-dropdown-button todo-list-dropdown-trash" aria-label={`delete list named ${listInfo.listName}`} onClick={() => {
>>>>>>> 1b37939 (Change data schema according to PR suggestion)
                                    setShowDeleteListModal(true);
                                }}>
                                    <IconContext.Provider value={{ size: '25px' }}>
                                        <FaTrashAlt />
                                    </IconContext.Provider>
                                </button>
                            }
                        </div>
                    </div>
                    {/* Container for show and sort dropdowns */}
                    <div className="todo-filters-container">
                        <Dropdown
                            menuLabel="Show:"
                            onSelectItem={setShowState}
                            menuState={showState}
                            options={ShowArr}
                            menuName="Show"
                        />
                        <Dropdown
                            menuLabel="Sort By:"
                            onSelectItem={(val) => {
                                setSortState(SortStrToEnum[val]);
                            }}
                            menuState={SortEnumToStr[sortState]}
                            options={SortByArr}
                            menuName="Sort"
                        />
                    </div>
                    {/* Container for list items */}
                    <div className="todo-list">
                        {!itemsData.length && <h1 className="empty-placeholder">No current items</h1>}
                        {itemsData.filter((item) => shouldShow(item)).map((item2) =>
                            <ListItem
                                key={item2.id}
                                id={item2.id}
                                text={item2.text}
                                completed={item2.completed}
                                priority={item2.priority}
                                onDeleteItem={onDeleteItem}
                                onEditItem={onEditItem}
                            />
                        )}
                    </div>
                    {/* Bottom bar with add, undo, and remove completed buttons */}
                    <div className="todo-footer">
                        <button className="todo-icon todo-button" aria-label={`add item to list named ${listInfo.listName}`} onClick={() => {
                            setShowAddItemModal(true);
                        }}>
                            <FaPlusCircle />
                        </button>
                        {itemsData && itemsData.some(item => item.completed) &&
                            <button className="todo-text todo-button" onClick={() => {
                                setShowDeleteItemModal(true);
                            }}>
                                Remove Completed
                            </button>
                        }
                        {undoStack.length > 0 &&
                            <button className="todo-icon todo-button" aria-label="undo previous operation" onClick={() => {
                                onUndo();
                            }}>
                                <FaUndo />
                            </button>
                        }
                    </div>
                    {/* Hidden modals for adding/editing/deleting items */}
                    {showAddItemModal &&
                        <AddEditItemModal
                            title="Add New List Item"
                            text="New Item Name"
                            priority="Low"
                            onCancel={() => {
                                setShowAddItemModal(false);
                            }}
                            onConfirm={(text, priority) => {
                                onAddItem(text, PriorityToNumber[priority]);
                                setShowAddItemModal(false);
                            }}
                        />
                    }
                    {showDeleteItemModal &&
                        <Modal
                            title="Delete Item(s)"
                            confirmText="Delete"
                            cancelText="Cancel"
                            onCancel={() => {
                                setShowDeleteItemModal(false);
                            }}
                            onConfirm={() => {
                                onRemoveCompleted();
                                setShowDeleteItemModal(false);
                            }}
                        >
                            {`Are you sure you want to delete ${itemsData.filter(item => item.completed).length} item(s)?`}
                        </Modal>
                    }
                    {/* Hidden modals for adding/editing/deleting lists */}
                    {showAddListModal &&
                        <AddEditListModal
                            title="Add New List"
                            name="New List Name"
                            onCancel={() => {
                                setShowAddListModal(false);
                            }}
                            onConfirm={(name) => {
                                onAddList(name);
                                setShowAddListModal(false);
                            }}
                        />
                    }
                    {showEditListModal &&
                        <AddEditListModal

                            title="Edit List Name"
                            name={listInfo.listName}
                            onCancel={() => {
                                setShowEditListModal(false);
                            }}
                            onConfirm={(name) => {
                                onEditList(listInfo.listId, listInfo.listName, name);
                                setShowEditListModal(false);
                            }}
                        />
                    }
                    {showDeleteListModal &&
                        <Modal
                            title="Delete List"
                            confirmText="Delete"
                            cancelText="Cancel"
                            onCancel={() => {
                                setShowDeleteListModal(false);
                            }}
                            onConfirm={() => {
                                onDeleteList(listInfo.listId, listInfo.listName);
                                setShowDeleteListModal(false);
                            }}
                        >
                            {`Are you sure you want to delete the list named "${listInfo.listName}"?`}
                        </Modal>
                    }
                </>
            }
        </div>
    );
}

export default App;
