 /* ========================================================================
 * WHG Frontend Framework
 *
 * @author: Steven Jackson
 * ======================================================================== */
/*
 * BEGIN IMPORTS
 */
import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import contains from 'dom-helpers/query/contains';
import keycode from 'keycode';
import warning from 'warning';
import all from 'prop-types-extra/lib/all';
import elementType from 'prop-types-extra/lib/elementType';
import isRequiredForA11y from 'prop-types-extra/lib/isRequiredForA11y';
import classNames from 'classnames';
import { customClass as setCoreClass, isUsable, dataExists, isLeftClickEvent, isModifiedEvent, createChainedFunction, prefix } from '../../utils/helpers.js';


class Button extends React.Component {
  static propTypes = {
    id: isRequiredForA11y(PropTypes.oneOfType([
      PropTypes.string, PropTypes.number,
    ])),
    componentClass: elementType,
    disabled: PropTypes.bool,
    open: PropTypes.bool,
    active: PropTypes.bool,
    config: PropTypes.object
  }

  static defaultProps = {
    whgrole: 'button',
    componentClass: 'button',
    disabled: false,
    active: false,
    config: {}
  }

  handleClick = (e) => {
    if (this.props.disabled) {
      return;
    }
    if (this.props.onClick) {
      this.props.onClick(e);
    }
    if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
      return;
    }
    if (e.defaultPrevented === true) {
      return;
    }
    e.preventDefault();
    if (this.props.historycallback) {
      this.props.historycallback(this.props.to);
    }
  }

  handleKeyDown = (event) => {
    if (this.props.disabled) {
      return;
    }
  }

  renderChild = (child, props) => {
    let ref = child.ref;
    return cloneElement(child, {
      ...props,
      ref,
      onClick: createChainedFunction(
        child.props.onClick, function() {},
      ),
      onKeyDown: createChainedFunction(
        child.props.onKeyDown, function() {},
      ),
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
      active,
      children,
      ...props
    } = this.props;

    delete props.whgrole;

    const classes = {
      [customClass]: true,
      disabled,
      open,
      active
    };

    return (
      <Component
        { ...props }
        className={ classNames(className, classes) }
        onClick={ (e) => this.handleClick(e) }
      >
        {React.Children.map(children, (child) => {
          if (typeof child.props !== 'undefined') {
            return this.renderChild(child, { disabled });
          } else {
            return child;
          }
        })}
      </Component>
    );
  }
}

export default setCoreClass('button', Button);
