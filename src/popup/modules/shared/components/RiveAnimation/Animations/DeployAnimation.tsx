import deployAnimationUrl from '@app/popup/assets/animations/deploy.riv';

import { RiveAnimation } from '../RiveAnimation';
import styles from './Animations.module.scss';

export const DeployAnimation = () => <RiveAnimation src={deployAnimationUrl} className={styles.popupAnimation} />;
