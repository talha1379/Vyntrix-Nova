import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setVisible(true);

      const target = event.target as HTMLElement | null;

      setHovering(
        !!target?.closest("a, button, input, textarea, select, summary, [role='button']"),
      );
    };

    const handleMouseDown = () => {
      setClicking(true);
    };

    const handleMouseUp = () => {
      setClicking(false);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`custom-cursor-dot ${visible ? "is-visible" : ""} ${
          clicking ? "is-clicking" : ""
        }`}
        style={{
          left: position.x,
          top: position.y,
        }}
      />

      <div
        aria-hidden="true"
        className={`custom-cursor-ring ${visible ? "is-visible" : ""} ${
          hovering ? "is-hovering" : ""
        } ${clicking ? "is-clicking" : ""}`}
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </>
  );
}
