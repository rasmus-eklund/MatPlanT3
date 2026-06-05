import { afterAll, afterEach } from "bun:test";
import { JSDOM } from "jsdom";
import React from "react";
import reactDomPackage from "react-dom/package.json";

Object.defineProperty(React, "version", {
  value: reactDomPackage.version,
});

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});
const frontendGlobals = ["window", "document", "navigator"] as const;

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  HTMLButtonElement: dom.window.HTMLButtonElement,
  HTMLSelectElement: dom.window.HTMLSelectElement,
  SVGElement: dom.window.SVGElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  NodeFilter: dom.window.NodeFilter,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
  FocusEvent: dom.window.FocusEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  MouseEvent: dom.window.MouseEvent,
  PointerEvent: dom.window.PointerEvent,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0),
  cancelAnimationFrame: (id: number) => clearTimeout(id),
});

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {
      return undefined;
    }
    unobserve() {
      return undefined;
    }
    disconnect() {
      return undefined;
    }
  };
}

if (!globalThis.DOMRect) {
  globalThis.DOMRect = dom.window.DOMRect;
}

afterEach(() => {
  document.body.innerHTML = "";
});

afterAll(() => {
  for (const key of frontendGlobals) {
    Reflect.deleteProperty(globalThis, key);
  }
});
