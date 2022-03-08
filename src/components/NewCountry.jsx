import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField, Button } from '@mui/material';
 
const NewCountry = (props) => {
    const [ name, setName ] = useState('');
    const [ open, setOpen ] = useState(false);
    const handleOpen = () => {
        setOpen(true);
        setName("");
    }
    const handleClose = () => {
        setOpen(false);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        props.onAdd(name);
        setOpen(false);
    }
    return (
            <div style={{maxWidth:64, width:"auto", margin:"auto"}}>
                <Button variant='outlined'  onClick={handleOpen} sx={{ mb:1, mx:"auto" , bgcolor: "#ffffff"}}>+</Button>
                <Dialog open={open} onClose={handleClose}>
                    <form onSubmit={ (e) => handleSubmit(e)}>
                    <DialogTitle>Add a Country</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter the name of a new country:
                        </DialogContentText>
                        <TextField
                            autoFocus
                            onChange={ (e) => setName(e.target.value) }
                            margin="dense"
                            id="name"
                            name="name"
                            value={ name }
                            label="Country Name"
                            type="text"
                            fullWidth
                            autoComplete="off"
                            autoCapitalize="off"
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button disabled={ name.trim().length === 0 } type="submit">Save</Button>
                    </DialogActions>
                    </form>
                </Dialog>
            </div>
    );
}

export default NewCountry