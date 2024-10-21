import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from '../styles/AboutModel.module.css';

function AboutModal(props) {
	return (
		<Modal
			{...props}
			size="lg"
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter" className={styles.title}>
					About <span className={styles.thoughtweb}>thoughtweb</span>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className={styles.description}>
					Let's say you have a notebook with 20 notes, and these notes have re-occuring ideas being 
					evaluated that you wished would be easier to follow in their formulation, so you rip the pages out, 
					tack them to a wall, and tie strings between the pages so you could follow the trains of thought more clearly.<br/><br/>
					This site is an online journal and note organizer that utilizes connections with other entries to overview the courses 
					of thoughts, using the advantages technology brings (accessablity, unlimited note space, simple organization 
					and searching) to find more insight.<br/>
					<br/>
					<div className='textCenter'>GitHub repository <a href='https://github.com/paulmeddaugh/thoughtweb' target='_blank'>here</a>.</div>
					<div className='textCenter'>Trello board <a href='https://trello.com/b/IUqaznxv/thoughtweb' target='_blank'>here</a>.</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={props.onHide}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default AboutModal;