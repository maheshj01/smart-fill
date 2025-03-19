"use strict";
let currentInput: HTMLInputElement | null = null;
let autoFillIcon: HTMLElement | null = null;
let isProcessingFocusEvent = false;

function injectAutoFillIcon() {
    // Remove any existing icons first
    removeAutoFillIcon();

    // Only show the icon if an input field is focused
    const focusedElement: HTMLInputElement | null = document.activeElement as HTMLInputElement;
    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
        currentInput = focusedElement;

        // Create the button
        autoFillIcon = document.createElement('button');
        autoFillIcon.id = 'autofill-icon';

        // Create an image element and set the source
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('../assets/gemini.png');
        img.alt = 'Auto-fill Icon';
        img.style.width = '24px';
        img.style.height = '24px';

        autoFillIcon.appendChild(img);

        // Style the button
        autoFillIcon.style.position = 'absolute';
        autoFillIcon.style.cursor = 'pointer';
        autoFillIcon.style.border = 'none';
        autoFillIcon.style.background = 'transparent';
        autoFillIcon.style.zIndex = '10000'; // Ensure it appears above other elements

        const rect = currentInput.getBoundingClientRect();
        autoFillIcon.style.left = `${rect.right - 30}px`;
        autoFillIcon.style.top = `${window.scrollY + rect.top + (rect.height - 24) / 2}px`; // Center vertically

        // Add the click event listener with capture to ensure it gets the event first
        autoFillIcon.addEventListener('click', handleIconClick, true);
        autoFillIcon.addEventListener('mousedown', handleMouseDown, true);

        document.body.appendChild(autoFillIcon);
        console.log('Autofill icon injected'); // Debug logging
    }
}

function handleMouseDown(event: MouseEvent) {
    // Prevent the input from losing focus when clicking the icon
    event.preventDefault();
    event.stopPropagation();
}

function handleIconClick(event: MouseEvent) {
    console.log('Autofill icon clicked'); // Debug logging
    event.preventDefault();
    event.stopPropagation();

    isProcessingFocusEvent = true;

    if (currentInput) {
        handleAutoFill(currentInput);
    }

    setTimeout(() => {
        isProcessingFocusEvent = false;
    }, 500);

    return false;
}

function removeAutoFillIcon() {
    const existingIcon = document.getElementById('autofill-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
}

async function handleAutoFill(input: HTMLInputElement | null) {
    console.log('Handling autofill for', input); // Debug logging
    try {
        const data = await fetchAutoFillData();
        console.log('Got data:', data); // Debug logging
        if (input) {
            input.value = data;
            // Trigger input event to notify the page of the change
            input.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Input value set to:', data); // Debug logging
        }
    } catch (error) {
        console.error('Error in handleAutoFill:', error);
    }
}

async function fetchAutoFillData() {
    try {
        // For testing purposes
        console.log('Fetching autofill data...'); // Debug logging
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'Auto filled data';
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error occurred';
    }
}

// Track currently focused input
document.addEventListener('focusin', function (event: FocusEvent) {
    if (isProcessingFocusEvent) return;

    const target = event.target as HTMLElement;
    console.log('Focus event detected on', target.tagName); // Debug logging

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
    if (relatedTarget && relatedTarget.id === 'autofill-icon') {
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