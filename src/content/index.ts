

"use strict";

import { resourceUsage } from "process";
import Constants from "../react/Constants";
import Gemini from "./gemini";

let currentInput: HTMLInputElement | null = null;
let autoFillIcon: HTMLElement | null = null;
let isProcessingFocusEvent = false;

function injectAutoFillIcon() {
  // Remove any existing icons first
  removeAutoFillIcon();

  // Only show the icon if an input field is focused
  const focusedElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;

  if (
    focusedElement &&
    (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')
  ) {
    // Ignore input types that shouldn't have the autofill icon
    if (
      focusedElement instanceof HTMLInputElement &&
      ['radio', 'checkbox', 'password'].includes(focusedElement.type)
    ) {
      return;
    }

    currentInput = focusedElement as HTMLInputElement;

    // Create the button
    autoFillIcon = document.createElement('button');
    autoFillIcon.id = Constants.autoFillIconId;

    // Create an image element and set the source
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('../assets/gemini.png');
    img.alt = 'Auto-fill Icon';
    img.style.width = '24px';
    img.style.height = '24px';

    autoFillIcon.appendChild(img);

    // Style the button
    Object.assign(autoFillIcon.style, {
      position: 'absolute',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      zIndex: '10000', // Ensure it appears above other elements
    });

    const rect = currentInput.getBoundingClientRect();
    autoFillIcon.style.left = `${rect.right - 30}px`;
    autoFillIcon.style.top = `${window.scrollY + rect.top + (rect.height - 24) / 2}px`; // Center vertically

    // Add the click event listener with capture to ensure it gets the event first
    autoFillIcon.addEventListener('click', handleIconClick, true);
    autoFillIcon.addEventListener('mousedown', handleMouseDown, true);

    document.body.appendChild(autoFillIcon);
  }
}

function handleMouseDown(event: MouseEvent) {
  // Prevent the input from losing focus when clicking the icon
  event.preventDefault();
  event.stopPropagation();
}

function handleIconClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  // Set a flag to prevent focus events from removing the icon during autofill
  isProcessingFocusEvent = true;

  if (currentInput) {
    handleAutoFill(currentInput);
  }

  // Reset the flag after a short delay
  setTimeout(() => {
    isProcessingFocusEvent = false;
  }, 500);

  return false;
}

function removeAutoFillIcon() {
  const existingIcon = document.getElementById(Constants.autoFillIconId);
  if (existingIcon) {
    existingIcon.remove();
  }
}

// Find the label associated with an input element
function findInputLabel(input: any): string {
  let labelText = '';

  // Method 1: Check for the 'for' attribute matching the input's ID
  if (input.id) {
    const labelElement = document.querySelector(`label[for="${input.id}"]`);
    if (labelElement && labelElement.textContent) {
      labelText = labelElement.textContent.trim();
    }
  }

  // Method 2: Check if the input is wrapped inside a label
  if (!labelText) {
    let parent = input.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL' && parent.textContent) {
        labelText = parent.textContent.trim()
          .replace(input.value, '') // Remove input value if it's part of the label
          .trim();
        break;
      }
      parent = parent.parentElement;
    }
  }

  // Method 3: Check for aria-label attribute
  if (!labelText && input.getAttribute('aria-label')) {
    labelText = input.getAttribute('aria-label') || '';
  }

  // Method 4: Check for placeholder as fallback
  if (!labelText && input.getAttribute('placeholder')) {
    labelText = input.getAttribute('placeholder') || '';
  }

  // Method 5: Check for name attribute as last resort
  if (!labelText && input.getAttribute('name')) {
    labelText = input.getAttribute('name') || '';
  }

  // Method 6: Check nearby elements that might be labels
  if (!labelText) {
    // Look for nearby elements that might be acting as labels
    const rect = input.getBoundingClientRect();
    const possibleLabels = Array.from(document.querySelectorAll('div, span, p'))
      .filter(el => {
        const elRect = el.getBoundingClientRect();
        // Check if element is close to the input (above, left, or right)
        const isNearby = (
          (Math.abs(elRect.bottom - rect.top) < 20 || // Above
            Math.abs(elRect.right - rect.left) < 50)   // Left
        );
        return isNearby && el.textContent && el.textContent.trim().length > 0;
      });

    if (possibleLabels.length > 0) {
      // Take the closest one
      labelText = possibleLabels[0].textContent?.trim() || '';
    }
  }

  return labelText;
}

// Get additional context about the input field
function getInputContext(input: HTMLElement): object {
  const labelText = findInputLabel(input);

  // Get input attributes and properties
  const context = {
    label: labelText,
    id: input.id || '',
    name: input.getAttribute('name') || '',
    type: input.getAttribute('type') || input.tagName.toLowerCase(),
    placeholder: input.getAttribute('placeholder') || '',
    value: (input as HTMLInputElement).value || '',
    form: input.closest('form') ? getFormContext(input.closest('form') as HTMLFormElement) : null,
    pageTitle: document.title,
    url: window.location.href,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  };

  return context;
}

// Get context about the form containing the input
function getFormContext(form: HTMLFormElement): object {
  if (!form) return {};

  // Try to identify form purpose
  const formAction = form.getAttribute('action') || '';
  const formId = form.id || '';
  const formClass = form.className || '';

  // Look for common form elements that might indicate purpose
  const hasEmailField = !!form.querySelector('input[type="email"]');
  const hasPasswordField = !!form.querySelector('input[type="password"]');
  const hasNameFields = !!form.querySelector('input[name*="name" i], input[placeholder*="name" i]');
  const hasAddressFields = !!form.querySelector('input[name*="address" i], input[placeholder*="address" i]');

  // Determine likely form type
  let formType = 'unknown';
  if (formAction.includes('login') || formAction.includes('signin') ||
    formId.includes('login') || formClass.includes('login') ||
    (hasEmailField && hasPasswordField)) {
    formType = 'login';
  } else if (formAction.includes('register') || formAction.includes('signup') ||
    formId.includes('register') || formClass.includes('register')) {
    formType = 'registration';
  } else if (hasNameFields && hasAddressFields) {
    formType = 'address';
  } else if (formAction.includes('search') || formId.includes('search')) {
    formType = 'search';
  } else if (formAction.includes('checkout') || formId.includes('checkout')) {
    formType = 'checkout';
  }

  return {
    formType,
    actionUrl: formAction,
    id: formId,
    className: formClass
  };
}


async function handleAutoFill(input: HTMLInputElement | null) {
  try {
    const gemini = new Gemini(API_Key || '', mappedResumeData || {}, resumeDataRaw || {});
    if (!input) return;
    const inputContext = getInputContext(input);
    const currentInputText = input.value;
    const data = await gemini.fetchAutoFillData(inputContext, currentInputText,);

    if (input) {
      input.value = data;
      // Trigger input event to notify the page of the change
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (error) {
    console.error('Error in handleAutoFill:', error);
  }
}

// Track currently focused input
document.addEventListener('focusin', function (event: FocusEvent) {
  if (isProcessingFocusEvent) return;

  const target = event.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    // Small delay to let any previous focus events complete
    setTimeout(() => {
      if (!isProcessingFocusEvent) {
        injectAutoFillIcon();
      }
    }, 50);
  }
});

// Only remove icon when focus moves to something other than our icon or an input
document.addEventListener('focusout', function (event: FocusEvent) {
  if (isProcessingFocusEvent) return;

  // Check what's receiving focus next
  const relatedTarget = event.relatedTarget as HTMLElement;

  // Don't remove if the focus is moving to our autofill icon
  if (relatedTarget && relatedTarget.id === Constants.autoFillIconId) {
    return;
  }

  // Don't remove if the focus is just moving between input fields
  if (relatedTarget && (relatedTarget.tagName === 'INPUT' || relatedTarget.tagName === 'TEXTAREA')) {
    return;
  }

  // Give a small delay before removing the icon to allow for clicks
  setTimeout(() => {
    if (!isProcessingFocusEvent) {
      removeAutoFillIcon();
    }
  }, 200);
});

// Handle window scroll/resize to reposition the icon
window.addEventListener('scroll', function () {
  if (currentInput && document.activeElement === currentInput) {
    injectAutoFillIcon();
  }
});

window.addEventListener('resize', function () {
  if (currentInput && document.activeElement === currentInput) {
    injectAutoFillIcon();
  }
});

// Initial check for any focused elements when the script loads
window.addEventListener('load', function () {
  setTimeout(injectAutoFillIcon, 500);
});

// when page is loaded, get api key from local storage

let API_Key = '';
let resumeDataRaw = {};
let mappedResumeData = {};

window.addEventListener('load', async () => {
  try {
    const fetchFromBackground = (action: string) =>
      new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action }, (response) => {
          if (chrome.runtime.lastError) {
            reject(`Chrome runtime error: ${chrome.runtime.lastError.message}`);
          } else if (!response) {
            reject(`No response received for ${action}`);
          } else {
            resolve(response);
          }
        });
      });

    // Fetch all required data in parallel
    const [apiKeyResponse, resumeResponse, mappedResumeResponse] = await Promise.all([
      fetchFromBackground(Constants.getApiKey),
      fetchFromBackground(Constants.getResumeData),
      fetchFromBackground(Constants.getMappedResumeData),
    ]);

    // Extract values from responses
    API_Key = (apiKeyResponse as any)?.data;
    resumeDataRaw = (resumeResponse as any)?.data;
    const resumeMapData = (mappedResumeResponse as any)?.data;

    // If mapped resume data is wrapped in ```json markers, extract valid JSON
    const match = resumeMapData?.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      mappedResumeData = JSON.parse(match[1]);
    }

    // console.log('Received API Key:', API_Key || 'Not found');
    // console.log('Received Resume Data:', resumeDataRaw || 'Not found');
    // console.log('Received Mapped Resume Data:', mappedResumeData || 'Not found');
  } catch (error) {
    console.error('Error loading data:', error);
  }
});