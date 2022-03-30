import './App.css';
import {useState, useEffect} from 'react';
import {FaPlus, FaPlusCircle, FaUndo, FaEdit, FaTrashAlt, FaClipboardList} from 'react-icons/fa';
import {IconContext} from 'react-icons';
import Dropdown from './Dropdown';
import ListItem from './ListItem';
import Modal from './Modal';
import AddEditItemModal from './AddEditItemModal';
import AddEditListModal from './AddEditListModal';
import { PriorityToNumber } from './ListItem';
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, query, collection, doc, setDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, writeBatch } from "firebase/firestore";
import { useCollectionData, useDocumentData} from "react-firebase-hooks/firestore";
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
const collectionName = "Users";
// Eventually will change once we add functionality for multiple users
// For now, have one global user for all list items
const userDocumentName = "User";
const collectionPath = `${collectionName}/${userDocumentName}/`;

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
    const userQuery = query(doc(db, collectionPath));
    const [userData, userLoading, userError] = useDocumentData(userQuery);

    const [subcollectionName, setSubcollectionName] = useState(null);
    // Set subcollection to first list after user data has loaded
    useEffect(() => {
        if (!subcollectionName) {
            setSubcollectionName(userData ? userData.lists[0] : null);
        }
    }, [userData, subcollectionName]);

    const itemsQuery = query(collection(db, collectionPath + subcollectionName), orderBy(sortField, sortOrder));
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
            oldList: subcollectionName,
            newList: null,
            data: itemsData,
        });

        const id = generateUniqueID();
        setDoc(doc(db, collectionPath + subcollectionName, id), {
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
            oldList: subcollectionName,
            newList: null,
            data: itemsData
        });

        updateDoc(doc(db, collectionPath + subcollectionName, id), {
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
            oldList: subcollectionName,
            newList: null,
            data: itemsData
        });

        deleteDoc(doc(db, collectionPath + subcollectionName, id));
    }

    // Remove completed items
    const onRemoveCompleted = () => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Delete,
            oldList: subcollectionName,
            newList: null,
            data: itemsData
        });

        const batch = writeBatch(db);

        itemsData.forEach((item) => {
            if (item.completed) {
                batch.delete(doc(db, collectionPath + subcollectionName, item.id));
            }
        });

        batch.commit();
    }

    // Add list
    const onAddList = (name) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Add,
            oldList: null,
            newList: name,
            data: [],
        });

        const newLists = [...userData.lists];
        newLists.push(name);
        updateDoc(doc(db, collectionName, userDocumentName), {
            lists: newLists
        });

        // Update state to be on newly added list
        setSubcollectionName(name);
    }

    // Edit list name
    const onEditList = (oldName, newName) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Edit,
            oldList: oldName,
            newList: newName,
            data: itemsData,
        });

        // Firestore does not support renaming collections
        // To rename list, must delete old list and re-add all of its items under new collection name
        // Use batch to make this operation atomic
        const batch = writeBatch(db);

        // Remove list from user lists array and replace with new list containing new list name
        const newLists = userData.lists.map((list) => {
            if (list === oldName) {
                return newName;
            } else {
                return list
            }
        });
        batch.update(doc(db, collectionName, userDocumentName), {
            lists: newLists
        });

        // Delete all items under old list name
        const oldItems = [...itemsData];
        oldItems.forEach((item) => {
            batch.delete(doc(db, collectionPath + subcollectionName, item.id));
        })

        // Add back all items under new list name
        oldItems.forEach((item) => {
            batch.set(doc(db, collectionPath + newName, item.id), {
               id: item.id,
               text: item.text,
               completed: item.completed,
               priority: item.priority,
               created: item.created,
            });
        });

        batch.commit();

        // Update state to be on newly edited list
        setSubcollectionName(newName);
    }

    // Delete list
    const onDeleteList = (name) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Delete,
            oldList: name,
            newList: null,
            data: itemsData,
        });

        // First delete all items in list
        const batch = writeBatch(db);
        itemsData.forEach((item) => {
            batch.delete(doc(db, collectionPath + subcollectionName, item.id));
        });
        batch.commit();

        // Then delete list itself from user array so it doesn't show in dropdown anymore
        const newLists = userData.lists.filter(list => list !== subcollectionName);
        updateDoc(doc(db, collectionName, userDocumentName), {
            lists: newLists
        })

        // Update state since current subcollection list no longer exists
        setSubcollectionName(userData.lists[0]);
    }

    // Undo operation so data is brought to previous state
    const onUndo = () => {
        const newStack = [...undoStack];
        const undo = newStack.pop();

        if (undo.type === UndoType.Item) { // Undo operation on item(s) within a list
            const batch = writeBatch(db);

            // Erase all current items from oldList
            const q = query(collection(db, collectionPath + undo.oldList));
            getDocs(q).then(res => {
                res.docs.forEach((item) => {
                    batch.delete(doc(db, collectionPath + undo.oldList, item.id));
                });

                // Add all items from data in back of undoStack
                undo.data.forEach((item) => {
                    batch.set(doc(db, collectionPath + undo.oldList, item.id), {
                        id: item.id,
                        text: item.text,
                        completed: item.completed,
                        priority: item.priority,
                        created: item.created,
                    });
                });

                // Make sure this operation is atomic
                batch.commit();
                setSubcollectionName(undo.oldList);
            })
        } else { // Undo operation on a list
            if (undo.op === UndoOp.Add) {
                onDeleteList(undo.newList);
            } else if (undo.op === UndoOp.Delete) {
                const batch = writeBatch(db);

                const newLists = [...userData.lists];
                newLists.push(undo.oldList);

                batch.update(doc(db, collectionName, userDocumentName), {
                    lists: newLists
                });

                undo.data.forEach((item) => {
                    batch.set(doc(db, collectionPath + undo.oldList, item.id), {
                        id: item.id,
                        text: item.text,
                        completed: item.completed,
                        priority: item.priority,
                        created: item.created,
                    });
                });

                batch.commit();
                setSubcollectionName(undo.oldList);
            } else {
                onEditList(undo.newList, undo.oldList);
            }
        }

        // Update the undoStack
        setUndoStack(newStack);
    }

    return (
        <div className="App">
            {(itemsLoading || userLoading) && <div className="loading-spinner"></div>}
            {(itemsError || userError) && <h1 className="empty-placeholder">Error occurred while trying to fetch data. Please try again later.</h1>}
            {!itemsLoading && !userLoading && !itemsError && !userError &&
                <>
                    {/* Top title bar with list changing buttons/dropdown */}
                    <div className="todo-text todo-title">
                        <div className="todo-list-dropdown-container">
                            <div className="todo-list-dropdown">
                                {/* To-Do: */}
                                <Dropdown
                                    menuLabel="To-Do:"
                                    onSelectItem={(val) => {
                                        setSubcollectionName(val);
                                    }}
                                    menuState={subcollectionName}
                                    options={userData.lists}
                                    menuName="List"
                                />
                            </div>
                        </div>
                        <div className="todo-list-dropdown-buttons-container">
                            <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-add" aria-label="add list" onClick={() => {
                                setShowAddListModal(true);
                                }}>
                                <FaPlus/>
                                <IconContext.Provider value={{ size: '25px' }}>
                                    <FaClipboardList/>
                                </IconContext.Provider>
                            </button>
                            <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-edit" aria-label={`edit list name of list named ${subcollectionName}`} onClick={() => {
                                setShowEditListModal(true);
                            }}>
                                <IconContext.Provider value={{ size: '27px' }}>
                                    <FaEdit />
                                </IconContext.Provider>
                            </button>
                            {userData.lists.length > 1 &&
                                <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-trash" aria-label={`delete list named ${subcollectionName}`} onClick={() => {
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
                        <button className="todo-icon todo-button" aria-label={`add item to list named ${subcollectionName}`} onClick={() => {
                            setShowAddItemModal(true);
                        }}>
                            <FaPlusCircle/>
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
                                <FaUndo/>
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
                            name={subcollectionName}
                            onCancel={() => {
                                setShowEditListModal(false);
                            }}
                            onConfirm={(name) => {
                                onEditList(subcollectionName, name);
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
                                onDeleteList(subcollectionName);
                                setShowDeleteListModal(false);
                            }}
                        >
                            {`Are you sure you want to delete the list named "${subcollectionName}"?`}
                        </Modal>
                    }
                </>
            }
        </div>
    );
}

export default App;
