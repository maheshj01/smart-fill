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
    const existingIcon = document.getElementById('autofill-icon');
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
        url: window.location.href
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
    console.log('Handling autofill for', input); // Debug logging
    try {
        if (!input) return;

        const inputContext = getInputContext(input);
        console.log('Input context:', inputContext);

        const data = await fetchAutoFillData(inputContext);
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

async function fetchAutoFillData(context: object): Promise<string> {
    try {
        console.log('Fetching autofill data for context:', context); // Debug logging

        // For now, return a sample response based on the context
        // In a real implementation, you would make an API call here
        await new Promise(resolve => setTimeout(resolve, 1000));

        const contextObj = context as any;
        const label = contextObj.label || '';

        // Generate different responses based on detected label/context
        if (label.toLowerCase().includes('email') || contextObj.name.toLowerCase().includes('email')) {
            return 'user@example.com';
        } else if (label.toLowerCase().includes('name') || contextObj.name.toLowerCase().includes('name')) {
            if (label.toLowerCase().includes('first')) {
                return 'John';
            } else if (label.toLowerCase().includes('last')) {
                return 'Doe';
            } else {
                return 'John Doe';
            }
        } else if (label.toLowerCase().includes('phone') || contextObj.name.toLowerCase().includes('phone')) {
            return '555-123-4567';
        } else if (label.toLowerCase().includes('address') || contextObj.name.toLowerCase().includes('address')) {
            return '123 Main St, Anytown, USA';
        } else {
            // Default response with some context info
            return `Auto filled data for ${label || 'this field'}`;
        }
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