import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './PrizeModal.css';

const PRIZE_IMAGES = [
  {
    src: '/prize/prize-1.png',
    caption: 'Redragon H260 RGB White — Front-Side Profile & Boom Mic',
  },
  {
    src: '/prize/prize-2.jpg',
    caption: 'Redragon H260 RGB White — Dynamic RGB Earcup Lighting',
  },
  {
    src: '/prize/prize-3.jpg',
    caption: 'Redragon H260 RGB White — Ergonomic Headband & Memory Foam Cushions',
  },
];

export default function PrizeModal({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + PRIZE_IMAGES.length) % PRIZE_IMAGES.length);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PRIZE_IMAGES.length);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, 4500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  return createPortal(
    <div
      className="prize-modal-fullscreen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prize-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="prize-modal-backdrop-glow" />

      <button
        type="button"
        className="prize-close-btn"
        onClick={onClose}
        aria-label="Close winning prize popup"
      >
        <span className="prize-close-icon">✕</span>
        <span className="prize-close-label">Close</span>
      </button>

      <div className="prize-modal-expand-container">
        <div className="prize-modal-header">
          <div className="prize-champion-pill">🏆 GRAND CHAMPION WINNING PRIZE</div>
          <h2 id="prize-modal-title" className="prize-modal-title">
            REDRAGON H260 RGB GAMING WHITE HEADSET
          </h2>
          <p className="prize-modal-subtitle">
            Hylas White Edition • 50mm Surround Drivers • Dynamic RGB Backlighting
          </p>
        </div>

        <div
          className="prize-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            type="button"
            className="carousel-nav-btn carousel-prev"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="carousel-stage">
            {PRIZE_IMAGES.map((item, idx) => (
              <div
                key={item.src}
                className={`carousel-slide ${idx === currentIndex ? 'active' : ''}`}
                aria-hidden={idx !== currentIndex}
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  className="carousel-img"
                />
              </div>
            ))}
            <div className="carousel-counter-badge">
              {currentIndex + 1} / {PRIZE_IMAGES.length}
            </div>
          </div>

          <button
            type="button"
            className="carousel-nav-btn carousel-next"
            onClick={handleNext}
            aria-label="Next image"
          >
            ›
          </button>
        </div>

        <div className="carousel-caption">
          {PRIZE_IMAGES[currentIndex].caption}
        </div>

        <div className="carousel-thumbnails">
          {PRIZE_IMAGES.map((item, idx) => (
            <button
              key={item.src}
              type="button"
              className={`carousel-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={item.src} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>

        <div className="prize-specs-row">
          <span className="prize-spec-chip">🎧 50mm Neodymium Drivers</span>
          <span className="prize-spec-chip">🌈 Dynamic RGB Lighting</span>
          <span className="prize-spec-chip">🎙️ Noise-Reducing Mic</span>
          <span className="prize-spec-chip">☁️ Memory Foam Cushions</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
