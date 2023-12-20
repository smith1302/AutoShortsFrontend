import Button from '@mui/material/Button';
import classes from './index.module.scss';
import clsx from 'clsx';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function DirectionalSortArrows ({className, selected, ...otherProps}) {
    return (
        <div className={clsx(classes.root, className)} {...otherProps}>
            {/* <i className={clsx(classes.arrow, classes.up, up ? classes.selected : null)}></i> */}
            <i className={clsx(classes.arrow, classes.down, selected ? classes.selected : null)}></i>
        </div>
    );
}