import classes from './index.module.css';
import clsx from 'clsx';

export default function PageHeaderHero({children, className}) {
    return (
        <div className={clsx(classes.root, className)}>
            {children}
        </div>
    )
}