/**
 * Replace the Retry button in error message overlay
 * @param {String} text
 * @param {Function} handleClick
 */
export function replaceRetryButton(text = 'OK', handleClick = f => f) {
    const existingButton = document.querySelector('#fd-hide');

    if (!existingButton) return;
    if (existingButton?.parentNode) existingButton.parentNode.removeChild(existingButton);

    const errorMessageContainer = document.querySelector('#error-message');
    if (!errorMessageContainer) return;

    const newButton = document.createElement('button');
    newButton.classList.add("btn");
    newButton.innerHTML = text;
    newButton.setAttribute('id', 'fd-ok');

    errorMessageContainer.appendChild(newButton);

    newButton.addEventListener('click', handleClick);
}

/**
 * Replace the Retry button in error message overlay with specific text
 * and hide the overlay when clicked on this button
 * @param {Session} session
 * @param {String} text
 */
export function replaceRetryButtonToDismissErrorMessage(session, text) {
    replaceRetryButton(text, () => {
        session.hide();
    });
}