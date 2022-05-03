import './App.css';
import { useState, useEffect } from 'react';
import { FaPlus, FaPlusCircle, FaUndo, FaEdit, FaTrashAlt, FaClipboardList, FaShareSquare, FaSignOutAlt } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Dropdown from './Dropdown';
import GroupedDropdown from './GroupedDropdown';
import ListItem from './ListItem';
import AddEditItemModal from './AddEditItemModal';
import AddEditListModal from './AddEditListModal';
import DeleteModal from './DeleteModal';
import { PriorityToNumber } from './ListItem';
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, query, collection, doc, setDoc, updateDoc, deleteDoc, orderBy, where, serverTimestamp, writeBatch } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { generateUniqueID } from "web-vitals/dist/modules/lib/generateUniqueID";
import {
    useAuthState,
    useCreateUserWithEmailAndPassword,
    useSignInWithEmailAndPassword,
    useSignInWithGoogle
} from 'react-firebase-hooks/auth';
import {
    getAuth,
    signOut
} from "firebase/auth";
import TabList from './TabList';
import ShareModal from './ShareModal';
import SignOutModal from './SignOutModal';

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
const auth = getAuth();
const collectionName = "Lists";
const subcollectionName = "Items";

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
    const [user, loading, error] = useAuthState(auth);

    return (
        <div className="App">
            {loading && <div className="loading-spinner"></div>}
            {!loading && !user &&
                <>
                    {error && <p>Error: {error.message}</p>}
                    <TabList>
                        <SignIn key="SignIn"/>
                        <SignUp key="SignUp"/>
                    </TabList>
                </>
            }
            {!loading && !error && user && <SignedInApp user={user}/>}
        </div>
    )
}

function SignIn() {
    const [signInWithEmailAndPassword, user1, loading1, error1] = useSignInWithEmailAndPassword(auth);
    const [signInWithGoogle, user2, loading2, error2] = useSignInWithGoogle(auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="App">
            {(user1 || user2) && <div>Unexpectedly signed in already</div>}
            {(loading1 || loading2) && <div className="loading-spinner"></div>}
            {(!loading1 && !loading2) &&
                <>
                    {error1 && <h1>"Error logging in: " {error1.message}</h1>}
                    {error2 && <h1>"Error logging in: " {error2.message}</h1>}
                    <label htmlFor="email">Email:</label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <br/>
                    <label htmlFor="password">Password: </label>
                    <input
                        type="text"
                        id="password"
                        value={password}
                        onChange = {e =>setPassword(e.target.value)}
                    />
                    <br/>
                    <button onClick={() =>signInWithEmailAndPassword(email, password)}>
                        Sign in with Email/Password
                    </button>
                    <hr/>
                    <button onClick={() => signInWithGoogle()}>
                        Sign in with Google
                    </button>
                </>
            }
        </div>
    );
}

function SignUp() {
    const [createUserWithEmailAndPassword, userCredential, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="App">
            {userCredential && <div>Unexpectedly signed in already</div>}
            {loading && <div className="loading-spinner"></div>}
            {(!loading) &&
                <>
                    {error && <p>"Error signing up: " {error.message}</p>}
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" value={email}
                        onChange={e => setEmail(e.target.value)}/>
                    <br/>
                    <label htmlFor="Password">Password:</label>
                    <input type="text" id="Password" value={password}
                        onChange={e => setPassword(e.target.value)}/>
                    <br/>
                    <button onClick={() => {
                        createUserWithEmailAndPassword(email, password);
                    }}>
                        Create User
                    </button>
                </>
            }
        </div>
    );
}

function SignedInApp(props) {
    // Sort order for list items
    const [sortState, setSortState] = useState(SortBy.Created_ASC);
    const sortArr = sortState.split("_");
    // Extract field and asc/desc order
    const sortField = sortArr[0].toLowerCase();
    const sortOrder = sortArr[1].toLowerCase();

    // Firestore query states
    const listsQuery = query(collection(db, collectionName), where("userId", "==", props.user.uid));
    const [listsData, listsLoading, listsError] = useCollectionData(listsQuery);
    console.log("listsError:", listsError);
    const sharedListsQuery = query(collection(db, collectionName), where("sharedWith", "array-contains", props.user.email));
    const [sharedListsData, sharedListsLoading, sharedListsError] = useCollectionData(sharedListsQuery);
    console.log("sharedListsError:", sharedListsError);


    // Need listId to query tasks of that list, but want to display listName
    const [listInfo, setListInfo] = useState({
        listId: null,
        listName: null,
        sharedWith: null,
        userId: null,
        userEmail: null,
        userName: null,
    });
    const listIdToListInfo = (id) => {
        for (const list of listsData) {
            if (list.listId === id) {
                return list;
            }
        }
        for (const list of sharedListsData) {
            if (list.listId === id) {
                return list;
            }
        }
    }
    // Set listId and listName to first list after lists data has loaded
    useEffect(() => {
        if (!listInfo.listId) {
            // Create a default list for new user since new user has no lists
            if (listsData && !listsData.length) {
                const id = generateUniqueID();
                setDoc(doc(db, collectionName, id), {
                    listId: id,
                    listName: "My First List",
                    sharedWith: [],
                    userId: props.user.uid,
                    userEmail: props.user.email,
                    userName: props.user.displayName,
                });
            }
            setListInfo({
                listId: (listsData && listsData.length) ? listsData[0].listId : null,
                listName: (listsData && listsData.length) ? listsData[0].listName : null,
                sharedWith: (listsData && listsData.length) ? listsData[0].sharedWith : null,
                userId: (listsData && listsData.length) ? listsData[0].userId : null,
                userEmail: (listsData && listsData.length) ? listsData[0].userEmail : null,
                userName: (listsData && listsData.length) ? listsData[0].userName : null,
            });
        }
    }, [listsData, listInfo.listId, props.user.uid, props.user.email, props.user.displayName]);
    const firstDifferentList = (id) => {
        for (const list2 of listsData) {
            if (id !== list2.listId) {
                return {
                    listId: list2.listId,
                    listName: list2.listName,
                    sharedWith: list2.sharedWith,
                    userId: list2.userId,
                    userEmail: list2.userEmail,
                    userName: list2.userName,
                };
            }
        }
    }

    const itemsQuery = query(collection(db, `${collectionName}/${listInfo.listId}/${subcollectionName}`), orderBy(sortField, sortOrder));
    const [itemsData, itemsLoading, itemsError] = useCollectionData(itemsQuery);
    console.log("itemsError:", itemsError);


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
    const [showShareModal, setShowShareModal] = useState(false);

    // Hidden modal for signing out
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    // Add item
    const onAddItem = (text, priority) => {
        pushUndoStack({
            type: UndoType.Item,
            op: UndoOp.Add,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: null,
            newListName: null,
            newSharedWith: null,
            newUserId: null,
            newUserEmail: null,
            newUserName: null,
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
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: null,
            newListName: null,
            newSharedWith: null,
            newUserId: null,
            newUserEmail: null,
            newUserName: null,
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
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: null,
            newListName: null,
            newSharedWith: null,
            newUserId: null,
            newUserEmail: null,
            newUserName: null,
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
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: null,
            newListName: null,
            newSharedWith: null,
            newUserId: null,
            newUserEmail: null,
            newUserName: null,
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
            oldSharedWith: null,
            oldUserId: null,
            oldUserEmail: null,
            oldUserName: null,
            newListId: id,
            newList: name,
            newSharedWith: [],
            newUserId: props.user.uid,
            newUserEmail: props.user.email,
            newUserName: props.user.displayName,
            data: [],
        });

        setDoc(doc(db, collectionName, id), {
            listId: id,
            listName: name,
            userId: props.user.uid,
            userEmail: props.user.email,
            userName: props.user.displayName,
            sharedWith: [],
        });

        // Update state to be on newly added list
        setListInfo({
            listName: name,
            listId: id,
            sharedWith: [],
            userId: props.user.uid,
            userEmail: props.user.email,
            userName: props.user.displayName,
        });
    }

    // Edit list name
    const onEditListName = (oldName, newName) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Edit,
            oldListId: listInfo.listId,
            oldListName: oldName,
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: listInfo.listId,
            newListName: newName,
            newSharedWith: listInfo.sharedWith,
            newUserId: listInfo.userId,
            newUserEmail: listInfo.userEmail,
            newUserName: listInfo.userName,
            data: itemsData,
        });

        // Update list name
        updateDoc(doc(db, collectionName, listInfo.listId), {
            listName: newName,
         });

        // Update state to be on newly edited list
        setListInfo({
            listName: newName,
            listId: listInfo.listId,
            sharedWith: listInfo.sharedWith,
            userId: listInfo.userId,
            userEmail: listInfo.userEmail,
            userName: listInfo.userName,
        });
    }

    // Delete list
    const onDeleteList = (id, name, sharedWith, userId, userEmail, userName) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Delete,
            oldListId: id,
            oldListName: name,
            oldSharedWith: sharedWith,
            oldUserId: userId,
            oldUserEmail: userEmail,
            oldUserName: userName,
            newListId: null,
            newListName: null,
            newSharedWith: null,
            newUserId: null,
            newUserEmail: null,
            newUserName: null,
            data: itemsData,
        });

        deleteDoc(doc(db, collectionName, id));

        // Update state since current subcollection list no longer exists
        setListInfo(firstDifferentList(id));
    }

    // Add/delete email to/from sharedWith attribute of list
    const onEditSharedEmails = (newSharedWith) => {
        pushUndoStack({
            type: UndoType.List,
            op: UndoOp.Edit,
            oldListId: listInfo.listId,
            oldListName: listInfo.listName,
            oldSharedWith: listInfo.sharedWith,
            oldUserId: listInfo.userId,
            oldUserEmail: listInfo.userEmail,
            oldUserName: listInfo.userName,
            newListId: listInfo.listId,
            newListName: listInfo.listName,
            newSharedWith: newSharedWith,
            newUserId: listInfo.userId,
            newUserEmail: listInfo.userEmail,
            newUserName: listInfo.userName,
            data: itemsData,
        });

        // Update list sharedWith
        updateDoc(doc(db, collectionName, listInfo.listId), {
            sharedWith: newSharedWith,
         });

        // Update state to be on newly edited list
        setListInfo({
            listName: listInfo.listName,
            listId: listInfo.listId,
            sharedWith: newSharedWith,
            userId: listInfo.userId,
            userEmail: listInfo.userEmail,
            userName: listInfo.userName,
        });
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
                    sharedWith: undo.oldSharedWith,
                    userId: undo.oldUserId,
                    userEmail: undo.oldUserEmail,
                    userName: undo.oldUserName,
                });
            });
        } else { // Undo operation on a list
            if (undo.op === UndoOp.Add) {
                // Delete list
                batch.delete(doc(db, collectionName, undo.newListId));

                // Update state since current subcollection list no longer exists
                setListInfo(firstDifferentList(undo.newListId));
            } else if (undo.op === UndoOp.Delete) {
                // Add back list
                batch.set(doc(db, collectionName, undo.oldListId), {
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                    sharedWith: undo.oldSharedWith,
                    userId: undo.oldUserId,
                    userEmail: undo.oldUserEmail,
                    userName: undo.oldUserName,
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
                    sharedWith: undo.oldSharedWith,
                    userId: undo.oldUserId,
                    userEmail: undo.oldUserEmail,
                    userName: undo.oldUserName,
                });
            } else {
                // Revert back to old list name
                batch.update(doc(db, collectionName, undo.oldListId), {
                    listName: undo.oldListName,
                });

                setListInfo({
                    listId: undo.oldListId,
                    listName: undo.oldListName,
                    sharedWith: undo.oldSharedWith,
                    userId: undo.oldUserId,
                    userEmail: undo.oldUserEmail,
                    userName: undo.oldUserName,
                });
            }

            batch.commit();
        }

        // Update the undoStack
        setUndoStack(newStack);
    }

    return (
        <div className="App">
            {(listsLoading || sharedListsLoading || itemsLoading) && <div className="loading-spinner"></div>}
            {listsError && <h1 className="empty-placeholder">"Error fetching data: " {listsError.message}</h1>}
            {sharedListsError && <h1 className="empty-placeholder">"Error fetching data: " {sharedListsError.message}</h1>}
            {itemsError && <h1 className="empty-placeholder">"Error fetching data: " {itemsError.message}</h1>}
            {!listsLoading && !sharedListsLoading && !itemsLoading && !listsError && !sharedListsError && !itemsError &&
                <>
                    {/* Top title bar with list changing buttons/dropdown */}
                    <div className="todo-text todo-title">
                        <div className="todo-list-dropdown-container">
                            <div className="todo-list-dropdown">
                                <span className="todo-list-dropdown-label">To-Do:</span>
                                <GroupedDropdown
                                    selectClass={"main-list-select-mui"}
                                    dropdownWidth={120}
                                    menuLabel=""
                                    onSelectItem={(val) => {
                                        setListInfo(listIdToListInfo(val));
                                    }}
                                    menuState={listInfo.listId}
                                    data1={listsData}
                                    data2={sharedListsData}
                                    menuName="Lists"
                                    emailOwner={listInfo.userEmail}
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
                            {listsData.length > 1 && props.user.uid === listInfo.userId &&
                                <button className="todo-icon todo-list-dropdown-button todo-list-dropdown-trash" aria-label={`delete list named ${listInfo.listName}`} onClick={() => {
                                    setShowDeleteListModal(true);
                                }}>
                                    <IconContext.Provider value={{ size: '25px' }}>
                                        <FaTrashAlt />
                                    </IconContext.Provider>
                                </button>
                            }
                            {props.user.uid === listInfo.userId &&
                                <button className="todo-icon todo-list-dropdown-button" aria-label={`edit shared people that can edit list named ${listInfo.listName}`} onClick={() => {
                                    setShowShareModal(true);
                                }}>
                                    <IconContext.Provider value={{ size: '27px' }}>
                                        <FaShareSquare />
                                    </IconContext.Provider>
                                </button>
                            }
                            <button type="button" className="todo-icon todo-list-dropdown-button" aria-label="sign out" onClick={() => setShowSignOutModal(true)}>
                                <IconContext.Provider value={{ size: '27px' }}>
                                    <FaSignOutAlt />
                                </IconContext.Provider>
                            </button>
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
                            <button className="todo-text todo-button" aria-label={`remove completed items for list named ${listInfo.listName}`} onClick={() => {
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
                        <DeleteModal
                            title="Delete Item(s)"
                            text={`Are you sure you want to delete ${itemsData.filter(item => item.completed).length} item(s)?`}
                            onCancel={() => {
                                setShowDeleteItemModal(false);
                            }}
                            onConfirm={() => {
                                onRemoveCompleted();
                                setShowDeleteItemModal(false);
                            }}
                        />
                    }
                    {/* Hidden modals for adding/editing/deleting lists */}
                    {showAddListModal &&
                        <AddEditListModal
                            title="Add New List"
                            name="New List"
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
                                onEditListName(listInfo.listName, name);
                                setShowEditListModal(false);
                            }}
                        />
                    }
                    {showDeleteListModal &&
                        <DeleteModal
                            title="Delete List"
                            text={`Are you sure you want to delete the list named "${listInfo.listName}"?`}
                            onCancel={() => {
                                setShowDeleteListModal(false);
                            }}
                            onConfirm={() => {
                                onDeleteList(listInfo.listId, listInfo.listName, listInfo.sharedWith, listInfo.userId, listInfo.userEmail, listInfo.userName);
                                setShowDeleteListModal(false);
                            }}
                        />
                    }
                    {showShareModal &&
                        <ShareModal
                            title={`Share List "${listInfo.listName}"`}
                            list={listInfo.listName}
                            sharedWith={listInfo.sharedWith}
                            onCancel={() => {
                                setShowShareModal(false);
                            }}
                            onConfirm={(email) => {
                                const newSharedWith = listInfo.sharedWith.concat([email]);
                                onEditSharedEmails(newSharedWith);
                                setShowShareModal(false);
                            }}
                            onDeleteItem={(email) => {
                                const newSharedWith = listInfo.sharedWith.filter(e => e !== email);
                                onEditSharedEmails(newSharedWith);
                            }}
                        />
                    }
                    {showSignOutModal &&
                        <SignOutModal
                            title={"Sign Out"}
                            text={"Are you sure you want to sign out?"}
                            onCancel={() => {
                                setShowSignOutModal(false);
                            }}
                            onConfirm={() => {
                                signOut(auth);
                                setShowSignOutModal(false);
                            }}
                        />
                    }
                </>
            }
        </div>
    );
}

export default App;
