/* ========================================================================
 * @author: Steven Jackson
 * ======================================================================== */

/* eslint-disable */
import React, {Component} from 'react'
import PropTypes from 'prop-types';
import isRequiredForA11y from 'prop-types-extra/lib/isRequiredForA11y';
import classNames from 'classnames';
import {
  uID,
  isUsable,
  dataExists,
  clientTimeZone,
} from './utils/helpers';
import Calendar from './components/Calendar/Calendar.js';
import Dropdown from './components/Dropdown/Dropdown.js';

const tz = clientTimeZone();

export default class DatePicker extends Component {
  static propTypes = {
    id: isRequiredForA11y(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
    className: PropTypes.string,
    children: PropTypes.node,
    disabled: PropTypes.bool,
    config: PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.string,
      invalid: PropTypes.bool,
      inputenabled: PropTypes.bool,
      iconenabled: PropTypes.bool,
      expiredlock: PropTypes.bool,
      onSelect: PropTypes.func,
    }),
  };

  static defaultProps = {
    disabled: false,
    className: null,
    children: null,
    config: {
      name: 'datepicker_element',
      value: '',
			invalid: false,
      inputenabled: false,
      iconenabled: false,
      expiredlock: false,
      onSelect: null,
    },
  };

  constructor(props) {
    super(props);
    const { value } = this.props.config;
    let date;
    let dateLocale;
    let selected;
    if (isUsable(value) && value.indexOf) {
      const dateString = value.indexOf('Z') !== -1 ? value : `${value}Z`;
      date = new Date(dateString);
      dateLocale = date.toLocaleDateString({ timeZone: tz });
      selected = {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    } else {
      date = new Date();
      dateLocale = '';
      selected = {
        day: 0,
        month: 0,
        year: 0,
      };
    }

    this.state = {
      loadedDate: date,
      loadedValue: dateLocale,
      viewYear: date.getFullYear(),
      viewType: 'days',
      selectedDate: selected,
    };
  }

  componentWillReceiveProps = nextProps => {
    const { value } = nextProps.config;
    this.reset(value);
  };

  reset = defaultDate => {
    let date;
    let dateLocale;
    let selected;
    if (isUsable(defaultDate) && defaultDate.indexOf) {
      const dateProp = defaultDate;
      const dateString =
        dateProp.indexOf('Z') !== -1 ? dateProp : `${dateProp}Z`;
      date = new Date(dateString);
      dateLocale = date.toLocaleDateString({ timeZone: tz });
      selected = {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    } else {
      date = new Date();
      dateLocale = '';
      selected = {
        day: 0,
        month: 0,
        year: 0,
      };
    }
    this.setState({
      loadedDate: date,
      loadedValue: dateLocale,
      viewType: 'days',
      selectedDate: selected,
    });
  };

  updateDateValues = (date, viewType, keepOpen) => {
    const { name, onSelect } = this.props.config;
    const value = date.toLocaleDateString({ timeZone: tz });
    const newData = this.state;
    newData.loadedDate = date;
    if (!keepOpen) {
      newData.loadedValue = value;
    }
    newData.viewType = viewType;
		//console.log((!keepOpen && onSelect));
    if (!keepOpen && onSelect) {
      newData.selectedDate = {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
      this.setState(newData);
      onSelect(date.toISOString(), name);
      document.dispatchEvent(new MouseEvent('mousedown'));
    } else {
      this.setState(newData);
    }
  };

  handleOnClosed = () => {
    const { value } = this.props.config;
    if (value) {
      this.reset(value);
    }
  };

  handleOnToday = () => {
    const date = new Date();
    const newData = this.state;
    newData.loadedDate = date;
    newData.selectedDate = {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
    };
    newData.loadedValue = date.toLocaleDateString({ timeZone: tz });
    this.setState(newData);
  };

  handleOnClear = () => {
    const { name, onSelect } = this.props.config;
    if (onSelect) {
      onSelect(null, name);
    }
    document.dispatchEvent(new MouseEvent('mousedown'));
  };

  handleOnChange = e => {
    const { name, onSelect } = this.props.config;
    if (onSelect) {
      onSelect(e.target.value, name);
    }
  };

  handlePrevClick = e => {
    e.preventDefault();
    e.stopPropagation();
    const t = this.state.viewType;
    if (t === 'years') {
      const newData = this.state;
      newData.viewYear = this.state.viewYear - 1;
      if (newData.viewYear >= Calendar.yearMin) {
        this.setState(newData);
      }
    } else {
      const date = this.state.loadedDate;
      if (t === 'months') {
        date.setYear(date.getFullYear() - 1);
        if (date.getFullYear() < Calendar.yearMin) {
          return date.setYear(date.getFullYear() + 1);
        }
      } else {
        date.setMonth(date.getMonth() - 1);
        if (date.getFullYear() < Calendar.yearMin) {
          return date.setMonth(date.getMonth() + 1);
        }
      }
      this.updateDateValues(date, t, true);
    }
    return true;
  };

  handleNextClick = e => {
    e.preventDefault();
    e.stopPropagation();
    const t = this.state.viewType;
    if (t === 'years') {
      const newData = this.state;
      newData.viewYear = this.state.viewYear + 1;
      if (newData.viewYear <= Calendar.yearViewMax) {
        this.setState(newData);
      }
    } else {
      const date = this.state.loadedDate;
      if (t === 'months') {
        date.setYear(date.getFullYear() + 1);
        if (date.getFullYear() > Calendar.yearMax) {
          return date.setYear(date.getFullYear() - 1);
        }
      } else {
        date.setMonth(date.getMonth() + 1);
        if (date.getFullYear() > Calendar.yearMax) {
          return date.setMonth(date.getMonth() - 1);
        }
      }
      this.updateDateValues(date, t, true);
    }
    return true;
  };

  handleViewChange = e => {
    e.preventDefault();
    const attr = e.target.attributes;
    this.setState({ viewType: attr.viewtype.value });
  };

  handleDateChange = e => {
    e.preventDefault();
    const attr = e.target.attributes;
    const d = attr.day.value;
    const m = attr.month.value;
    const y = attr.year.value;
    const date = new Date(y, m, d);
    this.updateDateValues(date, 'days', true);
  };

  handleDateSelect = e => {
    e.preventDefault();
    const attr = e.target.attributes;
    const d = attr.day.value;
    const m = attr.month.value;
    const y = attr.year.value;
    const t = this.state.viewType;
    const date = new Date(y, m, d);
    this.updateDateValues(date, t, false);
  };

  renderSingleDay = (monthVal, data) => {
    const { expiredlock } = this.props.config;
    const sd = this.state.selectedDate;
    const keyName = `${data.day}-${data.month}-${data.year}`;
    const selectedClass =
      data.year === sd.year && data.month === sd.month && data.day === sd.day
        ? ' theme-content_active'
        : '';
    if ((expiredlock && !data.enabled) || data.month !== monthVal) {
      return (
        <td
          key={`day-cell_${keyName}`}
          className={`datepicker-day-cell datepicker-cell-disabled ${
            selectedClass
          }`}
        >
          <span
            key={`day-button_${keyName}`}
            className={`datepicker-day datepicker-disabled ${selectedClass}`}
          >
            {data.day}
          </span>
        </td>
      );
    }
    return (
      <td
        key={`day-cell_${keyName}`}
        className={`datepicker-day-cell theme-content-item ${selectedClass}`}
      >
        <span
          key={`day-button_${keyName}`}
          className={`datepicker-day theme-content-item ${selectedClass}`}
          day={data.day}
          month={data.month}
          year={data.year}
          onClick={this.handleDateSelect}
          onKeyDown={this.handleDateSelect}
          role="presentation"
        >
          {data.day}
        </span>
      </td>
    );
  };

  renderSingleWeek = (monthVal, weekData) => (
    <tr key={uID()}>
      {this.renderSingleDay(monthVal, weekData[0])}
      {this.renderSingleDay(monthVal, weekData[1])}
      {this.renderSingleDay(monthVal, weekData[2])}
      {this.renderSingleDay(monthVal, weekData[3])}
      {this.renderSingleDay(monthVal, weekData[4])}
      {this.renderSingleDay(monthVal, weekData[5])}
      {this.renderSingleDay(monthVal, weekData[6])}
    </tr>
  );

  renderCalendar = (monthVal, yearVal) => {
    const output = [];
    if (isUsable(yearVal) && dataExists(Calendar.data[yearVal])) {
      const monthData = Calendar.data[yearVal][monthVal];
      if (monthData) {
        for (let i = 0; i < 5; i += 1) {
          output.push(this.renderSingleWeek(monthVal, monthData[i]));
        }
      }
    }
    return output;
  };

  renderMonthRow = value => {
    const monthVal = parseInt(value, 10);
    const date = this.state.loadedDate;
    const dayVal = date.getDate();
    const viewMonth = date.getMonth();
    const yearVal = date.getFullYear();
    const class1 = viewMonth === monthVal ? ' theme-input_active' : '';
    const class2 = viewMonth === monthVal + 1 ? ' theme-input_active' : '';
    const class3 = viewMonth === monthVal + 2 ? ' theme-input_active' : '';
    return (
      <tr key={uID()}>
        <td className={`datepicker-month-cell theme-input${class1}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal}
            year={yearVal}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {Calendar.monthName[monthVal]}
          </span>
        </td>
        <td className={`datepicker-month-cell theme-input${class2}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal + 1}
            year={yearVal}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {Calendar.monthName[monthVal + 1]}
          </span>
        </td>
        <td className={`datepicker-month-cell theme-input${class3}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal + 2}
            year={yearVal}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {Calendar.monthName[monthVal + 2]}
          </span>
        </td>
      </tr>
    );
  };

  renderYearRow = value => {
    const yearVal = parseInt(value, 10);
    const date = this.state.loadedDate;
    const dayVal = date.getDate();
    const monthVal = date.getMonth();
    const viewYear = date.getFullYear();
    const class1 = viewYear === yearVal ? ' theme-input_active' : '';
    const class2 = viewYear === yearVal + 1 ? ' theme-input_active' : '';
    const class3 = viewYear === yearVal + 2 ? ' theme-input_active' : '';
    const class4 = viewYear === yearVal + 3 ? ' theme-input_active' : '';
    return (
      <tr key={uID()}>
        <td className={`datepicker-year-cell theme-input${class1}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal}
            year={yearVal}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {yearVal}
          </span>
        </td>
        <td className={`datepicker-year-cell theme-input${class2}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal}
            year={yearVal + 1}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {yearVal + 1}
          </span>
        </td>
        <td className={`datepicker-year-cell theme-input${class3}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal}
            year={yearVal + 2}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {yearVal + 2}
          </span>
        </td>
        <td className={`datepicker-year-cell theme-input${class4}`}>
          <span
            className="datepicker-control"
            day={dayVal}
            month={monthVal}
            year={yearVal + 3}
            onClick={this.handleDateChange}
            onKeyDown={this.handleDateChange}
            role="presentation"
          >
            {yearVal + 3}
          </span>
        </td>
      </tr>
    );
  };

  renderWindow = disabled => {
    if (disabled) {
      return <span />;
    }
    const activeDate = isUsable(this.state.loadedDate)
      ? this.state.loadedDate
      : Calendar.today;
    const viewMonth = activeDate.getMonth();
    let viewYear = activeDate.getFullYear();
    const footer = [];
    if (this.state.viewType === 'years') {
      viewYear = this.state.viewYear;
      const years = [];
      years.push(this.renderYearRow(viewYear));
      years.push(this.renderYearRow(viewYear + 4));
      years.push(this.renderYearRow(viewYear + 8));
      years.push(this.renderYearRow(viewYear + 12));
      years.push(this.renderYearRow(viewYear + 16));
      years.push(this.renderYearRow(viewYear + 20));
      if (isUsable(this.state.loadedValue)) {
        footer.push(
          <tfoot key={uID()}>
            <tr>
              <td colSpan={4}>
                <span
                  className="datepicker-clear"
                  onClick={this.handleOnToday}
                  onKeyDown={this.handleOnToday}
                  role="presentation"
                >
                  Today
                </span>
              </td>
            </tr>
          </tfoot>,
        );
      }
      return (
        <table className="datepicker-table">
          <thead>
            <tr>
              <th className="datepicker-control-cell">
                <span
                  className="datepicker-control"
									onClick={this.handlePrevClick}
                  onKeyDown={this.handlePrevClick}
                  role="presentation"
                >
                  <i className="fa fa-chevron-left" />
                </span>
              </th>
              <th colSpan={2} className="datepicker-header-cell">
                <span className="datepicker-control">
                  Select a year
                </span>
              </th>
              <th className="datepicker-control-cell">
                <span
                  className="datepicker-control"
									onClick={this.handleNextClick}
                  onKeyDown={this.handleNextClick}
                  role="presentation"
                >
                  <i className="fa fa-chevron-right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>{years}</tbody>
          {footer}
        </table>
      );
    } else if (this.state.viewType === 'months') {
      const months = [];
      months.push(this.renderMonthRow(0));
      months.push(this.renderMonthRow(3));
      months.push(this.renderMonthRow(6));
      months.push(this.renderMonthRow(9));
      if (isUsable(this.state.loadedValue)) {
        footer.push(
          <tfoot key={uID()}>
            <tr>
              <td colSpan={3}>
                <span
                  className="datepicker-clear"
                  onClick={this.handleOnToday}
                  onKeyDown={this.handleOnToday}
                  role="presentation"
                >
                  Today
                </span>
              </td>
            </tr>
          </tfoot>,
        );
      }
      return (
        <table className="datepicker-table">
          <thead>
            <tr>
              <th className="datepicker-control-cell">
                <span
                  className="datepicker-control"
									onClick={this.handlePrevClick}
                  onKeyDown={this.handlePrevClick}
                  role="presentation"
                >
                  <i className="fa fa-chevron-left" />
                </span>
              </th>
              <th className="datepicker-header-cell">
                <span
                  className="datepicker-control"
                  viewtype="years"
                  onClick={this.handleViewChange}
                  onKeyDown={this.handleViewChange}
                  role="presentation"
                >
                  {viewYear}
                </span>
              </th>
              <th className="datepicker-control-cell">
                <span
                  className="datepicker-control"
									onClick={this.handleNextClick}
                  onKeyDown={this.handleNextClick}
                  role="presentation"
                >
                  <i className="fa fa-chevron-right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>{months}</tbody>
          {footer}
        </table>
      );
    }
    const headerText = `${Calendar.monthName[viewMonth]} ${viewYear}`;
    if (isUsable(this.state.loadedValue)) {
      footer.push(
        <tfoot key={uID()}>
          <tr>
            <td colSpan={7}>
              <span
                className="datepicker-clear"
                onClick={this.handleOnToday}
                onKeyDown={this.handleOnToday}
                role="presentation"
              >
                Today
              </span>
            </td>
          </tr>
        </tfoot>,
      );
    }
    return (
      <table className="datepicker-table">
        <thead>
          <tr>
            <th colSpan={1} className="datepicker-control-cell">
              <span
                className="datepicker-control"
                onClick={this.handlePrevClick}
                onKeyDown={this.handlePrevClick}
                role="presentation"
              >
                <i className="fa fa-chevron-left" />
              </span>
            </th>
            <th colSpan={5} className="datepicker-header-cell">
              <span
                className="datepicker-control"
                viewtype="months"
                onClick={this.handleViewChange}
                onKeyDown={this.handleViewChange}
                role="presentation"
              >
                {headerText}
              </span>
            </th>
            <th colSpan={1} className="datepicker-control-cell">
              <span
                className="datepicker-control"
                onClick={this.handleNextClick}
                onKeyDown={this.handleNextClick}
                role="presentation"
              >
                <i className="fa fa-chevron-right" />
              </span>
            </th>
          </tr>
          <tr>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[0]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[1]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[2]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[3]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[4]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b-r">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[5]}
              </span>
            </th>
            <th className="datepicker-weekday-cell datepicker-bordered-b">
              <span className="datepicker-weekday">
                {Calendar.dayAbbrev[6]}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>{this.renderCalendar(viewMonth, viewYear)}</tbody>
        {footer}
      </table>
    );
  };

  renderToggle = (id, iconenabled, inputenabled, disabled, invalid) => {
    const { expiredlock } = this.props.config;
    const icon = [];
    let invalidClass = invalid ? ' invalid': '';
    let expiredClass = '';
    let iconClass = '';
    if (expiredlock && Calendar.isExpired(this.state.loadedDate)) {
      expiredClass = ' datepicker-expired';
    }
    if (disabled) {
      const label = isUsable(this.state.loadedValue)
        ? this.state.loadedValue
        : 'MM/DD/YYYY';
      return (
        <span className="datepicker-toggle datepicker-disabled">
          {icon}
          {label}
        </span>
      );
    }
    if (inputenabled) {
      if (iconenabled) {
        iconClass = ' prepend-icon';
        icon.push(
          <i
            key={`datepicker-icon_${id}`}
            id={`datepicker-icon_${uID()}`}
            className="fa fa-calendar input-icon prepended"
            aria-hidden="true"
          />,
        );
      }
      return (
        <Dropdown.Toggle
          key={`datepicker-toggle_${id}`}
          id={`datepicker-toggle_${uID()}`}
          className={`input-text ${expiredClass}${iconClass}${invalidClass}`}
          componentClass="div"
        >
          {icon}
          <input
            key={`datepicker-input_${id}`}
            id={`datepicker-input_${uID()}`}
            type="text"
	          className={`datepicker-text ${invalidClass}`}
            onChange={this.handleOnChange}
            value={this.state.loadedValue}
            placeholder="MM/DD/YYYY"
          />
        </Dropdown.Toggle>
      );
    }
    if (iconenabled) {
      icon.push(
        <i
          key={`datepicker-icon_${id}`}
          id={`datepicker-icon_${uID()}`}
          className="fa fa-calendar"
          aria-hidden="true"
        />,
      );
    }
    const label = isUsable(this.state.loadedValue)
      ? this.state.loadedValue
      : 'MM/DD/YYYY';
    return (
      <Dropdown.Toggle
        key={`datepicker-toggle_${id}`}
        id={`datepicker-toggle_${uID()}`}
        className={`datepicker-toggle ${expiredClass}`}
      >
        {icon}
        <span
				className={`datepicker-text ${invalidClass}`}>{label}</span>
      </Dropdown.Toggle>
    );
  };

  render() {
    const {
      id,
      className,
      disabled,
      config,
      children,
      ...props
    } = this.props;

    const { iconenabled, inputenabled, invalid } = config;

    const hasValue = isUsable(this.state.loadedValue);

    const classes = {
      'datepicker': true,
      disabled,
      muted: hasValue === false,
    };

    delete props.change;

    return (
      <Dropdown
        id={id}
        {...props}
        className={classNames(className, classes)}
        onClose={this.handleOnClosed}
      >
        {this.renderToggle(id, iconenabled, inputenabled, disabled, invalid)}
        <Dropdown.Content
          key={`datepicker-window_${id}`}
          id={`datepicker-window_${uID()}`}
          className="datepicker-window"
        >
          {this.renderWindow(disabled)}
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

