/* IMPORT MODULES */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const moment = require('moment');
const cx = require('classnames');

moment.locale('es');

/* COMPONENT */
const Event = ({
  event: {
    _id, name, enabled, dislays, description, group, type
  }, edit, active,
}) => {
  const elementClass = cx('list-group-item-action list-group-item flex-column align-items-start', { active });
  return (
    <div className={elementClass} role="button" tabIndex={0} onClick={() => edit(_id)} onKeyDown={() => edit(_id)}>
      <div className="elemento elemento-configuracion">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">
            <strong>
              <FontAwesomeIcon icon="stopwatch" className="mr-2" fixedWidth />
              {name}
            </strong>
          </h5>
          <small>
            {enabled}
						x
            {type}
          </small>
        </div>
        <div className="d-flex w-100 align-content-right">
          <p className="mb-0">{description}</p>
        </div>
        <div className="d-flex w-100 justify-content-between">
        </div>
      </div>
    </div>
  );
};

Event.propTypes = {
  event: PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
  edit: PropTypes.func,
  active: PropTypes.bool,
};

Event.defaultProps = {
  edit: () => false,
  active: false,
};

export default Event;
