/**
 * @copyright Devexperts
 *
 * @requires DX
 * @requires DX.Dom
 * @requires DX.Event
 * @namespace
 */
var NumericStepper = (function(DX, window, document, undefined) {
    'use strict';

    var event = DX.Event,
        dom = DX.Dom,
        isTouchSupported = DX.isTouchAvailable(),
        CN_STEPPER = 'numericStepper',
        CN_STEPPER_CONTROL = CN_STEPPER + '--control',
        CN_STEPPER_CONTROL_UP = CN_STEPPER_CONTROL + '-up',
        CN_STEPPER_CONTROL_DOWN = CN_STEPPER_CONTROL + '-down',
        CN_STEPPER_INPUT = CN_STEPPER + '--input',
        CN_CORRECTED = 'corrected',
        CN_CHANGED = 'changed',
        CHANGED_TIMEOUT = 500,
        REPEAT_INTERVAL = 50,
        REPEAT_DELAY = 300,
        E_PUSHDOWN = isTouchSupported ? 'touchstart' : 'mousedown',
        E_PUSHUP = isTouchSupported ? 'touchend' : 'mouseup',
        E_INPUT = 'input',
        KEY_UP_CODE = 38,
        KEY_DOWN_CODE = 40,
        tmpl = [
                '<span class="' + CN_STEPPER_INPUT + '"></span>',
                '<button type="button" class="button ' + CN_STEPPER_CONTROL + ' ' + CN_STEPPER_CONTROL_DOWN + '"><span>−</span></button>',
                '<button type="button" class="button ' + CN_STEPPER_CONTROL + ' ' + CN_STEPPER_CONTROL_UP + '"><span>+</span></button>'
        ].join(''),
        E_ANIMATION_PREFIX = (function() {
            var cssProp,
                eventPrefix = '',
                testElement = document.createElement('div'),
                vendorPrefixes = {
                    animation: 'animation',
                    '-moz-animation': 'animation',
                    '-webkit-animation': 'webkitAnimation',
                    '-ms-animation': 'MSAnimation'
                };

            for (cssProp in vendorPrefixes) {
                if (Object.prototype.hasOwnProperty.call(vendorPrefixes, cssProp)) {
                    if (testElement.style[cssProp] !== undefined) {
                        eventPrefix = vendorPrefixes[cssProp];
                    }
                }
            }

            return eventPrefix;
        }()),
        E_ANIMATION_END = E_ANIMATION_PREFIX + ((E_ANIMATION_PREFIX === 'animation') ? 'end' : 'End');

    function toggleButtonStates(elements) {
        var input = elements.input,
            upButton = elements.upButton,
            downButton = elements.downButton;

        downButton.disabled = (parseFloat(input.value) <= parseFloat(input.min));
        upButton.disabled = (parseFloat(input.value) >= parseFloat(input.max));
    }

    function stepBy(n, elements) {
        //real input[type=number] approximates value to the nearest (n*step)
        var input = elements.input,
            currentValue = parseFloat(input.value) || 0,
            newValue = currentValue + input.step * n;

        if (isInRange(newValue, input.min, input.max)) {
            setUniqueValue(elements, newValue.toFixed(input.precision));
        }
    }

    function isLess(value, min) {
        return (parseFloat(value) < min);
    }

    function isMore(value, max) {
        return (parseFloat(value) > max);
    }

    function isInRange(value, min, max) {
        return (!isLess(value, min) && !isMore(value, max));
    }

    function setValue(elements, value) {
        var input = elements.input,
            selectionStart = input.selectionStart;

        if (isNaN(value) && value !== '-') {
            value = '';
        }
        input.value = value;

        restoreCursorPosition(input, selectionStart);
        toggleButtonStates(elements);
        fireChangeEvent(input);
    }
    function restoreCursorPosition(input, cursorPosition) {
        if (document.activeElement === input) {
            input.selectionStart = input.selectionEnd = cursorPosition;
        }
    }
    function setUniqueValue(elements, value) {
        if (elements.input.value !== value) {
            setValue(elements, value);
        }
    }
    /**
     * Numericstepper value has changed
     *
     * @event NumericStepper#numericstepper:changed
     */
    function fireChangeEvent(input) {
        event.trigger(input, NumericStepper.E_CHANGED);
    }
    /**
     * Numericstepper value was corrected
     *
     * @event NumericStepper#numericstepper:corrected
     */
    function notifyOnCorrection(input) {
        var notificationTimeOut;

        input.classList.add(CN_CORRECTED);

        function notificationTimeoutHandler() {
            input.classList.remove(CN_CORRECTED);

            window.clearTimeout(notificationTimeOut);
            input.removeEventListener(E_ANIMATION_END, notificationTimeoutHandler, true);
        }

        notificationTimeOut = window.setTimeout(notificationTimeoutHandler, 3000);
        input.addEventListener(E_ANIMATION_END, notificationTimeoutHandler, true);

        event.trigger(input, NumericStepper.E_CORRECTED);
    }


    /**
     * @constructor NumericStepper
     * @param {HTMLInputElement} input
     * @fires NumericStepper#numericstepper:changed
     * @fires NumericStepper#numericstepper:corrected
     */
    return function NumericStepper(input) {
        var elements = {},
            inputPattern, lastValue, block;

        function init() {
            prepareOriginalInput();
            initAppearance();
            updateConstraints();
            initListeners();

            lastValue = parseFloat(input.value) || '';
            inputPattern = new RegExp(input.pattern || input.getAttribute('pattern') || '^-?$|^-?\\d+([\\.\\,]\\d*)?$');
        }

        function prepareOriginalInput() {
            input.type = 'text';
            input.disabled = input.disabled || input.hasAttribute('disabled');
        }

        function initListeners() {
            [elements.upButton, elements.downButton].forEach(function(button) {
                button.addEventListener(E_PUSHDOWN, repeatStepChangeHandler);
            });

            input.addEventListener(DX.Event.KEY_DOWN, keyDownHandler);
            input.addEventListener(E_INPUT, normalizeInput);
            input.addEventListener(DX.Event.BLUR, applyConstraints);
            input.addEventListener(NumericStepper.E_UPDATE_CONSTRAINTS, updateConstraints);
            input.addEventListener(NumericStepper.E_CHANGE_VALUE, changeValueExternally);
            input.addEventListener(NumericStepper.E_SET_CURSOR_POSITION, setCursorPosition);
        }
        /**
         * Sets cursor to specified position
         *
         * @event NumericStepper#numericstepper:setucrsor
         * @property {Number} event.detail.position
         */
        function setCursorPosition(e) {
            if (e.detail) {
                restoreCursorPosition(input, e.detail.position);
            }
        }

        function changeValueExternally(e) {
            var selectionStart = input.selectionStart;
            if (e.detail) {
                input.value = e.detail.newVal;
            }
            checkPatternMatch();
            applyConstraints();

            restoreCursorPosition(input, selectionStart);
        }
        /**
         * Updates constraints according to element attributes
         * @method updateConstraints
         */
        /**
         * Numericstepper constraints attributes were changed
         *
         * @event NumericStepper#numericstepper:updateconstraints
         */
        function updateConstraints() {
            var precisionValue = parseFloat(input.getAttribute('data-precision')),
                minValue = parseFloat(input.getAttribute('min')),
                maxValue = parseFloat(input.getAttribute('max'));

            input.max = isNaN(maxValue) ? maxValue : input.max || Infinity;
            input.min = isNaN(minValue) ? minValue : input.min || 0;
            input.precision = !isNaN(precisionValue) ? precisionValue : input.precision || 0;
            input.step = parseFloat(input.getAttribute('step')) || input.step || 1;
        }

        function isDisabled() {
            return input.disabled;
        }
        /**
         * Numericstepper value was changed outside
         *
         * @event NumericStepper#numericstepper:changevalue
         */
        function normalizeInput() {
            normalizeLocale();
            checkPatternMatch();
            setValue(elements, lastValue);
        }
        /**
         * Applies constraints on input value, replaces comma with dot, rounds value to step
         * @method applyConstraints
         */
        function applyConstraints() {
            var currentValue = input.value,
                newValue;

            normalizeLocale();
            checkRange();
            roundToStep();
            setValue(elements, lastValue);

            newValue = input.value;

            if (newValue !== currentValue) {
                input.classList.add(CN_CHANGED);
                window.setTimeout(function() {
                    input.classList.remove(CN_CHANGED);
                }, CHANGED_TIMEOUT);
            }
        }
        function roundToStep() {

            if (input.hasAttribute('round')) {
                var currentValue = parseFloat(lastValue),
                    max = parseFloat(input.max),
                    min = parseFloat(input.min);

                if (currentValue >= max) {
                    currentValue = max;
                }
                if (currentValue <= min) {
                    currentValue = min;
                }

                currentValue = Math.floor((currentValue - min) / input.step) * input.step + min;
                lastValue = (currentValue).toFixed(input.precision);
            }

        }
        function normalizeLocale() {
            var selectionStart = input.selectionStart;

            input.value = input.value.replace(',', '.');
            restoreCursorPosition(input, selectionStart);
        }

        function checkPatternMatch() {
            var currentValue = input.value;

            if (inputPattern.test(currentValue)) {
                lastValue = currentValue;
            }
        }

        function checkRange() {
            var currentValue = input.value,
                max = input.max,
                min = input.min,
                newValue;


            if (isInRange(currentValue, min, max)) {
                newValue = parseFloat(currentValue).toFixed(input.precision);
            } else {
                if (isMore(currentValue, max)) {
                    newValue = parseFloat(max).toFixed(input.precision);
                } else {
                    newValue = parseFloat(min).toFixed(input.precision);
                }

                notifyOnCorrection(input);
            }

            if (!isNaN(newValue)) {
                lastValue = newValue;
            }
        }

        function isUpControl(control) {
            return control.classList.contains(CN_STEPPER_CONTROL_UP);
        }

        function repeatStepChangeHandler(e) {
            var repeatInterval,
                delayTimeout,
                operationHandler;

            if (!isDisabled()) {
                operationHandler = isUpControl(e.currentTarget) ? increase : decrease;

                operationHandler(elements);

                delayTimeout = window.setTimeout(function() {
                    repeatInterval = window.setInterval(function() {
                        operationHandler(elements);
                    }, REPEAT_INTERVAL);
                }, REPEAT_DELAY);

                document.addEventListener(E_PUSHUP, function stopRepeat() {
                    window.clearTimeout(delayTimeout);
                    window.clearInterval(repeatInterval);

                    document.removeEventListener(E_PUSHUP, stopRepeat);
                });
            }
        }

        function keyDownHandler(e) {
            var key;

            if (!isDisabled()) {
                key = e.key || e.which;

                if (key === KEY_UP_CODE || key === 'Up') {
                    e.preventDefault();
                    increase(elements);
                } else if (key === KEY_DOWN_CODE || key === 'Down') {
                    e.preventDefault();
                    decrease(elements);
                }
            }
        }

        function initAppearance() {
            block = dom.createElement('span', {
                'class': CN_STEPPER,
                innerHTML: tmpl
            });

            elements.input = input;
            elements.upButton = DX.$$('.' + CN_STEPPER_CONTROL_UP, block);
            elements.downButton = DX.$$('.' + CN_STEPPER_CONTROL_DOWN, block);

            dom.getParent(input).insertBefore(block, input);
            DX.$$('.' + CN_STEPPER_INPUT, block).appendChild(input);
        }
        /**
         * Increase value by 1
         * @method increase
         */
        function increase() {
            stepBy(1, elements);
        }
        /**
         * Decrease value by 1
         * @method decrease
         */
        function decrease() {
            stepBy(-1, elements);
        }

        init();

        this.increase = increase;
        this.decrease = decrease;
        this.applyConstraints = applyConstraints;
        this.updateConstraints = updateConstraints;
    };
})(DX, window, document);

/** @constant
 * @type {string}
 * @default
 * @memberof NumericStepper
 */
NumericStepper.E_CHANGED = 'numericstepper:changed';
/** @constant
 * @type {string}
 * @default
 * @memberof NumericStepper
 */
NumericStepper.E_UPDATE_CONSTRAINTS = 'numericstepper:updateconstraints';
/** @constant
 * @type {string}
 * @default
 * @memberof NumericStepper
 */
NumericStepper.E_CORRECTED = 'numericstepper:corrected';
/** @constant
 * @type {string}
 * @default
 * @memberof NumericStepper
 */
NumericStepper.E_CHANGE_VALUE = 'numericstepper:changevalue';
/** @constant
 * @type {string}
 * @default
 * @memberof NumericStepper
 */
NumericStepper.E_SET_CURSOR_POSITION = 'numericstepper:setcursor';