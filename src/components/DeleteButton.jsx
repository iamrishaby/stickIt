import Trash from "../icons/Trash";
import { db } from "../appwrite/databases";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { NoteContext } from "../context/NoteContext";
 
const DeleteButton = ({ noteId }) => {

    const { setNotes } = useContext(NoteContext);
 
    const handleDelete = async () => {
        db.notes.delete(noteId);
        setNotes((prevState) =>
            prevState.filter((note) => note.$id !== noteId)
        );
    };
 
    return (
        <div onClick={handleDelete}>
            <Trash />
        </div>
    );
};
DeleteButton.propTypes = {
    noteId: PropTypes.string.isRequired,
    setNotes: PropTypes.func.isRequired,
};

export default DeleteButton;
