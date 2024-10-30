import { useRef, useEffect, useState } from "react";
import { db } from "../appwrite/databases";
import PropTypes from 'prop-types';
import {setNewOffset} from '../utils.js'
import {setZIndex, bodyParser } from '../utils.js'
import Trash from "../icons/Trash";
import Spinner from "../icons/Spinner"; 


const NoteCard = ({ note }) => {
    const [saving, setSaving] = useState(false);
    const keyUpTimer = useRef(null);

    const body = bodyParser(note.body);
    const [position, setPosition] = useState(JSON.parse(note.position));
    const colors = JSON.parse(note.colors);

    let mouseStartPos = { x: 0, y: 0 };
    const cardRef = useRef(null);

    const textAreaRef = useRef(null);

    useEffect(() => {
        autoGrow(textAreaRef);
    }, []);

    const autoGrow=() => {
        const { current } = textAreaRef;
        current.style.height = "auto"; // Reset the height
        current.style.height = current.scrollHeight + "px"; // Set the new height
    };


    
    const mouseDown = (e) => {
        setZIndex(cardRef.current);
        mouseStartPos = { x: e.clientX, y: e.clientY };
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
    };
    
    const mouseMove = (e) => {
        const mouseMoveDir = {
            x: mouseStartPos.x - e.clientX,
            y: mouseStartPos.y - e.clientY,
        };
        
        mouseStartPos.x = e.clientX;
        mouseStartPos.y = e.clientY;
        

        const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
        setPosition(newPosition);
    };


    const mouseUp = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const newPosition = setNewOffset(cardRef.current); //{x,y}
        saveData("position", newPosition);
    };

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await db.notes.update(note.$id, payload);
        } catch (error) {
            console.error(error);
        }
        setSaving(false);
    };


    const handleKeyUp = async () => {
        //1 - Initiate "saving" state
        setSaving(true);
     
        //2 - If we have a timer id, clear it so we can add another two seconds
        if (keyUpTimer.current) {
            clearTimeout(keyUpTimer.current);
        }
     
        //3 - Set timer to trigger save in 2 seconds
        keyUpTimer.current = setTimeout(() => {
            saveData("body", textAreaRef.current.value);
        }, 2000);
    };
    
    return (
        <div
            ref={cardRef}
            className="card"
            style={{
                backgroundColor: colors.colorBody,
                left: `${position.x}px`,
                top: `${position.y}px`,
                
            }}
        >
            <div
                onMouseDown={mouseDown}
                className="card-header"
                style={{ backgroundColor: colors.colorHeader }}
    >

        <Trash />
        {saving && (
        <div className="card-saving">
            <Spinner color={colors.colorText} />
            <span style={{ color: colors.colorText }}>Saving...</span>
        </div>
        )}
    </div>

            <div className="card-body">
                <textarea 
                onKeyUp={handleKeyUp}
                onFocus={() => {
                    setZIndex(cardRef.current);
                }}
                ref = {textAreaRef}
                style={{ color: colors.colorText }}
                defaultValue={body}
                onInput={() => autoGrow(textAreaRef)}
                ></textarea>
                </div>
        </div>
    );
};



NoteCard.propTypes = {
    note: PropTypes.shape({
        body: PropTypes.string.isRequired,
        position: PropTypes.string.isRequired,
        colors: PropTypes.string.isRequired,
        $id: PropTypes.string.isRequired,
    }).isRequired,
};
export default NoteCard;