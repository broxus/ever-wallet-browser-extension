import { Children, memo, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { Navigation, Pagination, Virtual } from 'swiper'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import type {
    NavigationOptions,
    PaginationOptions,
    Swiper as SwiperClass,
    SwiperModule,
    VirtualOptions,
} from 'swiper/types'

import RightArrow from '@app/popup/assets/img/right-arrow.svg'
import LeftArrow from '@app/popup/assets/img/left-arrow.svg'
import ChangeAccountSrc from '@app/popup/assets/img/change-account.svg'

import { AddNewAccountCard } from '../AddNewAccountCard'

import 'swiper/scss'
import 'swiper/scss/virtual'
import 'swiper/scss/pagination'
import 'swiper/scss/navigation'
import './Carousel.scss'

type Props = PropsWithChildren<{
    current: number;
    onChange(index: number): void;
    onAddAccount(): void;
    onChangeAccount(): void;
}>

const TRANSFORM_REGEXP = /translateX\(-?(\d+)px\)/
const BULLET_WIDTH = 12

const modules: SwiperModule[] = [Virtual, Pagination, Navigation]
const virtual: VirtualOptions = {
    enabled: true,
    cache: false,
}
const navigation: NavigationOptions = {
    enabled: true,
    prevEl: '#slider-prev',
    nextEl: '#slider-next',
}
const pagination: PaginationOptions = {
    el: '#slider-pagination',
    type: 'custom',
    renderCustom,
}

export const Carousel = memo((props: Props): JSX.Element => {
    const { current, children, onAddAccount, onChangeAccount, onChange } = props
    const count = Children.toArray(children).length

    const ref = useRef<SwiperRef>(null)

    const handleSlideChange = useCallback(({ activeIndex }: SwiperClass) => onChange(activeIndex), [onChange])

    useEffect(() => {
        if (!ref.current) return
        if (current < count && current !== ref.current.swiper.activeIndex) {
            ref.current.swiper.slideTo(current)
        }
    }, [current, count])

    return (
        <div className="carousel">
            <Swiper
                centeredSlides
                ref={ref}
                spaceBetween={8}
                slidesPerView={1}
                longSwipes={false}
                speed={200}
                initialSlide={current}
                modules={modules}
                virtual={virtual}
                pagination={pagination}
                navigation={navigation}
                onSlideChange={handleSlideChange}
            >
                {Children.map(children, (child, index) => (
                    <SwiperSlide virtualIndex={index}>
                        {() => child}
                    </SwiperSlide>
                ))}
                <SwiperSlide key="addSlide" virtualIndex={count}>
                    <AddNewAccountCard onClick={onAddAccount} />
                </SwiperSlide>
            </Swiper>

            <div className="carousel__controls">
                <div className="carousel__controls-pagination">
                    <div id="slider-pagination" className="carousel__bullet-container" />
                </div>

                <div className="carousel__controls-buttons">
                    <button type="button" className="carousel__controls-btn" onClick={onChangeAccount}>
                        <img src={ChangeAccountSrc} alt="" />
                    </button>
                    <button id="slider-prev" type="button" className="carousel__controls-btn _arrow">
                        <img src={LeftArrow} alt="" />
                    </button>
                    <button id="slider-next" type="button" className="carousel__controls-btn _arrow">
                        <img src={RightArrow} alt="" />
                    </button>
                </div>
            </div>
        </div>
    )
})

function renderCustom(swiper: SwiperClass, current: number, total: number): void {
    const index = current - 1
    const dynamic = total > 13
    const isLast = current === total
    let offset = 0

    if (total !== swiper.pagination.bullets.length) {
        swiper.pagination.bullets = new Array(total)

        for (let i = 0; i < total; i++) {
            const el = document.createElement('div')
            el.classList.add('carousel__bullet')

            swiper.pagination.bullets[i] = el
        }
    }

    for (let i = 0; i < total; i++) {
        const el = swiper.pagination.bullets[i]
        el.classList.remove('_active', '_edge')

        if (i === index) {
            el.classList.add('_active')
        }
    }

    if (dynamic) {
        const container = swiper.pagination.el
        const currentOffset = parseInt(
            container?.style.transform.match(TRANSFORM_REGEXP)?.at(1) ?? '0',
            10,
        )
        let first = currentOffset / BULLET_WIDTH // first visible item index

        if (first + 13 < index) {
            first = index - 13 - (isLast ? 1 : 0)

        }
        if (index <= first) {
            first = Math.max(0, index - 1)
        }

        if (first !== 0) {
            swiper.pagination.bullets.at(first)?.classList.add('_edge')
        }
        if (!isLast) {
            swiper.pagination.bullets.at(first + 14)?.classList.add('_edge')
        }

        offset = first * BULLET_WIDTH * -1
    }

    swiper.pagination.el.style.transform = `translateX(${offset}px)`

    // @ts-ignore
    return swiper.pagination.bullets.map((el) => el.outerHTML).join('')
}
