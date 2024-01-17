import React, { useRef, useState } from 'react';
import { ProgramData } from "../../models/programModels";
import styles from '../../css/ProgramCard.module.css';
import { Link } from 'react-router-dom';

const ProgramCard: React.FC<{ program: ProgramData }> = ({ program }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: any) => {
    if(divRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - divRef.current.offsetLeft);
      setScrollLeft(divRef.current.scrollLeft);
    }
  }

  const handleDrag = (e: any) => {
    e.preventDefault();

    if(divRef.current && isDragging) {
      const x = e.pageX - divRef.current.offsetLeft;
      const scroll = x - startX;
      divRef.current.scrollLeft = scrollLeft - scroll;
    }

  }

  return (
    <div className={`p-0 col-lg-3 col-md-4 col-sm-6 col-xs-12`}>
      <div className={`card ${styles.programCard} m-2 rounded rounded-1`}>
        <img src={`/api/v1/program/${program.id}/image/`} className="card-img-top rounded-top rounded-1 w-100" style={{height: '250px', objectFit:'cover'}} alt="Program" />
        <div className={`card-body ${styles.cardBody}`}>
          <h5 className={`card-title mb-0 ${styles.programTitle}`}>{program.title}</h5>
          <p className={`mb-0 ${styles.programShowings}`}>{program.showings.length} {program.showings.length > 1 ? "showings" : "showing"}</p>
          <h6 className={`${styles.descriptionHeader}`}>Description</h6>
          <p className={`${styles.description}`}>{program.description}</p>
          <hr></hr>
          <h6 className={`${styles.descriptionHeader}`}>Themes</h6>
          <div
            ref={divRef}
            className={styles.themeList}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handleDragStart(e)}
            onMouseMove={(e) => handleDrag(e)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {program.themes.length > 0 ? program.themes.map((theme: Theme) => (
              <span key={theme.id} className={`badge badge-pill badge-primary ${styles.tag}`}>{theme.name}</span>
            )) : <p>No themes at this time</p>}
          </div>
          <Link to={`/programs/${program.id}`}>
            <button type="button" className={`btn btn-outline-info btn-sm ${styles.viewMore}`}>Learn More</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;