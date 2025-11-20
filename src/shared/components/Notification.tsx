import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const NotificationComponent = () => {
  return (
    <div className="group">
      <div className="aspect-square h-full relative flex items-center justify-center">
        <FontAwesomeIcon
          icon={faBell}
          className="text-muted-foreground group-hover:text-foreground duration-200"
        />
        <div className="w-1.5 h-1.5 absolute bg-chart-2 top-0 right-0 rounded-full"></div>
      </div>
    </div>
  );
};
