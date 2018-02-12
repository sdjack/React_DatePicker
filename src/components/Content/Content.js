 /* ========================================================================
 * WHG Frontend Framework
 *
 * @author: Steven Jackson
 * ======================================================================== */
 /*
 * BEGIN IMPORTS
 */
import React from 'react';
import PropTypes from 'prop-types';
import elementType from 'prop-types-extra/lib/elementType';
import classNames from 'classnames';
import { customClass as setCoreClass } from '../../utils/helpers.js';

export class Content extends React.Component {
  static propTypes = {
    componentClass: elementType,
    disabled: PropTypes.bool,
    open: PropTypes.bool
  }

  static defaultProps = {
    whgrole: 'content',
    componentClass: 'div',
    disabled: false,
    open: false
  }

  render() {
    const {
      componentClass: Component,
      customClass,
      className,
      disabled,
      open,
      children,
      ...props
    } = this.props;

    delete props.whgrole;

    const classes = {
      [customClass]: true,
      disabled,
      open
    };

    return (
      <Component
        {...props}
        className={classNames(className, classes)}
      >
        {children}
      </Component>
    );
  }
}

export default setCoreClass('content', Content);
