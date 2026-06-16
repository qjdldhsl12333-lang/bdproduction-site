import { ExternalLink, Play, X } from 'lucide-react';
import { forwardRef } from 'react';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 25" width="24" height="25" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="m15.335 13.332-3.661 3.74a.983.983 0 1 0 1.405 1.376l5.136-5.246c.38-.388.38-1.018 0-1.406L13.079 6.55a.983.983 0 1 0-1.405 1.376l3.66 3.74h-8.5a.833.833 0 0 0 0 1.666z"
      />
    </svg>
  );
}

function renderIcon(icon, iconNode) {
  if (iconNode) {
    return (
      <span className="bd-button__icon" aria-hidden="true">
        {iconNode}
      </span>
    );
  }

  if (icon === 'arrow') {
    return (
      <span className="bd-button__arrow-track" aria-hidden="true">
        <span className="bd-button__arrow bd-button__arrow-hover">
          <ArrowIcon />
        </span>
        <span className="bd-button__arrow bd-button__arrow-idle">
          <ArrowIcon />
        </span>
      </span>
    );
  }

  if (icon === 'external') {
    return (
      <span className="bd-button__icon" aria-hidden="true">
        <ExternalLink size={16} />
      </span>
    );
  }

  if (icon === 'play') {
    return (
      <span className="bd-button__icon" aria-hidden="true">
        <Play size={18} />
      </span>
    );
  }

  if (icon === 'close') {
    return (
      <span className="bd-button__icon" aria-hidden="true">
        <X size={20} />
      </span>
    );
  }

  return null;
}

const BdButton = forwardRef(function BdButton(
  {
    as: Component = 'button',
    children,
    className = '',
    variant = 'ghost',
    size = 'md',
    icon = 'none',
    iconNode = null,
    iconOnly = false,
    iconPosition = 'end',
    type,
    ...rest
  },
  ref
) {
  const renderedIcon = renderIcon(icon, iconNode);

  const classes = [
    'bd-button',
    `bd-button--${variant}`,
    `bd-button--${size}`,
    icon !== 'none' || iconNode ? `bd-button--${iconNode ? 'custom-icon' : icon}` : '',
    iconOnly ? 'bd-button--icon-only' : '',
    iconPosition === 'start' ? 'bd-button--icon-start' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const componentProps = {
    ...rest,
    ref,
    className: classes,
  };

  if (Component === 'button') {
    componentProps.type = type || 'button';
  } else if (type) {
    componentProps.type = type;
  }

  return (
    <Component {...componentProps}>
      {iconOnly ? (
        <>
          <span className="bd-button__sr-label">{children}</span>
          {renderedIcon}
        </>
      ) : (
        <>
          {iconPosition === 'start' && renderedIcon}
          <span className="bd-button__label">{children}</span>
          {iconPosition !== 'start' && renderedIcon}
        </>
      )}
    </Component>
  );
});

export default BdButton;
