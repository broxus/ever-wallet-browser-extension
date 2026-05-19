import loadingAnimationUrl from '@app/popup/assets/animations/loader.riv';

import { RiveAnimation } from '../RiveAnimation';
import styles from './Animations.module.scss';

export const LoadingAnimation = () => <RiveAnimation src={loadingAnimationUrl} className={styles.popupAnimation} />;
