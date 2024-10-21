import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function CustomConfirm({ confirmObj, setConfirmObj }) {

  const handleClose = () => setConfirmObj({});

  const cancel = () => {
    console.log(confirmObj.callback);
    confirmObj.callback.call(false);
    handleClose();
  }

  const ok = () => {
    console.log(confirmObj.callback);
    confirmObj.callback.call(true);
    handleClose();
  }

  return (
    <>
      <Modal show={Object.keys(confirmObj).length !== 0} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{confirmObj.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmObj.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={ok}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CustomConfirm;