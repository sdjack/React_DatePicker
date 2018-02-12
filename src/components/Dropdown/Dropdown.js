 /* ========================================================================
 * @author: Steven Jackson
 * ======================================================================== */
/* eslint-disable */
import React, { cloneElement } from 'react';
import ReactDOM from 'react-dom';
import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/query/contains';
import keycode from 'keycode';
import PropTypes from 'prop-types';
import all from 'prop-types-extra/lib/all';
import elementType from 'prop-types-extra/lib/elementType';
import isRequiredForA11y from 'prop-types-extra/lib/isRequiredForA11y';
import classNames from 'classnames';
import uncontrollable from 'uncontrollable';
import { exclusiveRoles, requiredRoles } from '../../utils/PropTypes.js';
import { customClass as setCoreClass, isUsable, dataExists, isLeftClickEvent, isModifiedEvent, createChainedFunction, prefix } from '../../utils/helpers.js';
import Button from '../Button/Button.js';
import Content from '../Content/Content.js';

const TOGGLE_ROLE = Button.defaultProps.whgrole;
const CONTENT_ROLE = Content.defaultProps.whgrole;

class Dropdown extends React.Component {
  static propTypes = {
    id: isRequiredForA11y(PropTypes.oneOfType([
      PropTypes.string, PropTypes.number,
    ])),
    children: all(
      exclusiveRoles(TOGGLE_ROLE, CONTENT_ROLE),
    ),
    componentClass: elementType,
    disabled: PropTypes.bool,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    defaultOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    role: PropTypes.string,
    rootcloseevent: PropTypes.oneOf(['click', 'mousedown']),
    onSelect: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func
  }

  static defaultProps = {
    componentClass: 'div',
    whgrole: 'dropdown',
    disabled: false,
    open: false
  }

  constructor(props, context) {
    super(props, context);
    this._focusInDropdown = false;
    this.lastOpenEventType = null;
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleOnToggle, false);
  }

  componentDidMount() {
    this.focusNextOnOpen();
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.open && this.props.open) {
      this._focusInDropdown = contains( ReactDOM.findDOMNode(this.content), activeElement(document) );
    }
  }

  componentDidUpdate(prevProps) {
    const { open } = this.props;
    const prevOpen = prevProps.open;
    if (open && !prevOpen) {
      this.focusNextOnOpen();
    }
    if (!open && prevOpen) {
      if (this._focusInDropdown) {
        this._focusInDropdown = false;
        this.focus();
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOnToggle, false);
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }

  handleOnToggle = (e) => {
    if (isModifiedEvent(e) || !isLeftClickEvent(e) || !this.props.open) {
      return;
    }
    if(this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      //console.log("handleClickOutside",e.target);
      this.handleClose(e);
    }
  }

  focus = () => {
    const toggle = ReactDOM.findDOMNode(this.toggle);
    if (toggle && toggle.focus) {
      toggle.focus();
    }
  }

  focusNextOnOpen = () => {
    const content = this.content;
    if (!content || !content.focusNext) {
      return;
    }
    if (
      this.lastOpenEventType === 'keydown' ||
      this.props.role === 'dropdown-item'
    ) {
      content.focusNext();
    }
  }

  handleClick = (event) => {
    if (this.props.disabled) {
      return;
    }
    this.toggleOpen(event, { source: 'click' });
  }

  handleClose = (event, eventDetails) => {
    if (!this.props.open) {
      return;
    }
    this.toggleOpen(event, eventDetails);
  }

  handleKeyDown = (event) => {
    if (this.props.disabled) {
      return;
    }
    switch (event.keyCode) {
      case keycode.codes.down:
        if (!this.props.open) {
          this.toggleOpen(event, { source: 'keydown' });
        } else if (this.content.focusNext) {
          this.content.focusNext();
        }
        event.preventDefault();
        break;
      case keycode.codes.esc:
        this.handleClose(event, { source: 'keydown' });
        break;
      default:
    }
  }

  toggleOpen = (event, eventDetails) => {
    let open = !this.props.open;
    if (open) {
      this.lastOpenEventType = eventDetails.source;
    } else if (this.props.onClose) {
      this.props.onClose(event);
    }
    if (this.props.onToggle) {
      this.props.onToggle(open, event, eventDetails);
    }
  }

  renderToggle = (child, { id, ...props }) => {
    let ref = (c) => { this.toggle = c; };
    if (typeof child.ref === 'string') {
      console.warn('String refs are not supported on dropdown components.');
    } else {
      ref = createChainedFunction(child.ref, ref);
    }
    return cloneElement(child, {
      ...props,
      ref,
      id: 'toggle_'+id,
      customClass: prefix(props, 'toggle'),
      onClick: createChainedFunction(
        child.props.onClick, this.handleClick,
      ),
      onKeyDown: createChainedFunction(
        child.props.onKeyDown, this.handleKeyDown,
      )
    });
  }

  renderContent = (child, { id, onSelect, ...props }) => {
    let ref = (c) => { this.content = c; };
    if (typeof child.ref === 'string') {
      console.warn('String refs are not supported on dropdown components.');
    } else {
      ref = createChainedFunction(child.ref, ref);
    }
    return cloneElement(child, {
      ...props,
      ref,
      id: 'content_'+id,
      customClass: prefix(props, 'content'),
      onMouseDown: function(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      },
      onSelect: createChainedFunction(
        child.props.onSelect,
        onSelect,
        (key, event) => this.handleClose(event, { source: 'select' }),
      )
    });
  }

  render() {
    const {
      componentClass: Component,
      id,
      customClass,
      className,
      disabled,
      open,
      onSelect,
      role,
      children,
      rootcloseevent,
      ...props
    } = this.props;

    delete props.whgrole;
    delete props.onToggle;
    delete props.onClose;

    const classes = {
      [customClass]: true,
      disabled,
      open
    };

    return (
      <Component
        id={'dropdown_'+id}
        {...props}
        className={classNames(className, classes)}
        ref={this.setWrapperRef}
      >
        {React.Children.map(children, (child) => {
          switch (child.props.whgrole) {
            case TOGGLE_ROLE:
              return this.renderToggle(child, { id, disabled, open, role, customClass });
            case CONTENT_ROLE:
              return this.renderContent(child, { id, onSelect, rootcloseevent, open, role, customClass });
            default:
              return child;
          }
        })}
      </Component>
    );
  }
}

setCoreClass('dropdown', Dropdown);

const UncontrolledDropdown = uncontrollable(Dropdown, { open: 'onToggle' });
UncontrolledDropdown.Toggle = Button;
UncontrolledDropdown.Content = Content;

//export default withStyles(s)(UncontrolledDropdown);
export default UncontrolledDropdown;
