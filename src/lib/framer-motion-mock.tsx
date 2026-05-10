import React from 'react';

export const motion = {
  div: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )),
  span: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <span ref={ref} {...props}>{children}</span>
  )),
  section: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <section ref={ref} {...props}>{children}</section>
  )),
  nav: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <nav ref={ref} {...props}>{children}</nav>
  )),
  header: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <header ref={ref} {...props}>{children}</header>
  )),
  footer: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <footer ref={ref} {...props}>{children}</footer>
  )),
  button: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <button ref={ref} {...props}>{children}</button>
  )),
  a: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <a ref={ref} {...props}>{children}</a>
  )),
  p: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <p ref={ref} {...props}>{children}</p>
  )),
  h1: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <h1 ref={ref} {...props}>{children}</h1>
  )),
  h2: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <h2 ref={ref} {...props}>{children}</h2>
  )),
  h3: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <h3 ref={ref} {...props}>{children}</h3>
  )),
  img: React.forwardRef(({ children, initial, animate, exit, transition, viewport, whileInView, whileHover, whileTap, ...props }: any, ref) => (
    <img ref={ref} {...props}>{children}</img>
  )),
};

export const AnimatePresence = ({ children }: any) => <>{children}</>;
export const useScroll = () => ({ scrollYProgress: { get: () => 0 } });
export const useTransform = () => 0;
export const useSpring = () => 0;
