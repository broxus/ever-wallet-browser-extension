import rocketAnimationUrl from '@app/popup/assets/animations/rocket.riv';

import { RiveAnimation } from '../RiveAnimation';
import styles from './Animations.module.scss';

export const RocketAnimation = () => <RiveAnimation src={rocketAnimationUrl} className={styles.popupAnimation} />;
