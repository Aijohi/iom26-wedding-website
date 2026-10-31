import { useRef, useState } from "react";
import "./CurtainReveal.css";

const MAXIMUM_DRAG = 132;
const OPENING_POINT = 104;

function CurtainReveal({ onReveal }) {
  const [dragDistance, setDragDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const startingY = useRef(0);
  const hasMoved = useRef(false);

  const updateHandlePosition = (value) => {
    const safeValue = Math.max(0, Math.min(value, MAXIMUM_DRAG));
    setDragDistance(safeValue);
    return safeValue;
  };

  const openCurtain = () => {
    if (isOpening) return;
    setIsOpening(true);
    setDragDistance(MAXIMUM_DRAG);
    window.setTimeout(() => onReveal?.(), 1450);
  };

  const handlePointerDown = (event) => {
    if (isOpening) return;
    setIsDragging(true);
    hasMoved.current = false;
    startingY.current = event.clientY - dragDistance;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || isOpening) return;
    const nextDistance = event.clientY - startingY.current;
    if (Math.abs(nextDistance - dragDistance) > 3) hasMoved.current = true;
    if (updateHandlePosition(nextDistance) >= OPENING_POINT) openCurtain();
  };

  const handlePointerUp = (event) => {
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!isOpening && dragDistance < OPENING_POINT) setDragDistance(0);
  };

  const handleClick = () => {
    if (!hasMoved.current) openCurtain();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCurtain();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (updateHandlePosition(dragDistance + 25) >= OPENING_POINT) openCurtain();
    }
  };

  return (
    <main className={`curtain-reveal ${isOpening ? "curtain-reveal--open" : ""}`}>
      <div className="curtain-reveal__glimpse" aria-hidden="true">
        <span>IOM’26</span>
        <p>Omonzele &amp; Ikponmwenosa</p>
      </div>

      <div className="curtain-reveal__curtain" aria-hidden="true">
        <div className="curtain-reveal__panel curtain-reveal__panel--left" />
        <div className="curtain-reveal__panel curtain-reveal__panel--right" />
        <div className="curtain-reveal__valance" />
      </div>

      <section className="curtain-reveal__content" aria-labelledby="curtain-title">
        <p>Our celebration awaits</p>
        <h1 id="curtain-title">Pull to enter<br />our world</h1>
      </section>

      <button
        className="curtain-reveal__pull"
        type="button"
        style={{ "--drag-distance": `${dragDistance}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label="Drag the IOM 26 wax seal down to open the wedding website"
        disabled={isOpening}
      >
        <span className="curtain-reveal__cord" aria-hidden="true" />
        <span className="curtain-reveal__seal" aria-hidden="true">
          <i>IOM</i><small>’26</small>
        </span>
      </button>

      <p className="curtain-reveal__instruction" style={{ "--drag-distance": `${dragDistance}px` }}>
        Drag the seal down
      </p>

      <button className="curtain-reveal__skip" type="button" onClick={openCurtain} disabled={isOpening}>
        Skip introduction
      </button>
    </main>
  );
}

export default CurtainReveal;
