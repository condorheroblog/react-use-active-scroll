import type { ReactNode, RefObject } from 'react'
import type { Section } from '../types'
import { ContainerScanLine } from './ScanLine'

interface HorizontalSectionsProps {
	sections: Section[]
	/** @zh 横向滚动容器 ref，透传给核心包 root 选项 @en Horizontal scroll container ref, passed through to the core root option */
	containerRef: RefObject<HTMLDivElement | null>
	/** @zh 是否显示 index / id 标注 @en Whether to show the index / id label */
	indexLabel?: boolean
	/** @zh 容器尾部额外内容（如尾部留白观察区） @en Extra content at the end of the container (e.g. a trailing whitespace observation area) */
	children?: ReactNode
}

/**
 * @zh 横向演示公共内容区。
 * 生成横向滚动容器与等宽卡片 section，供 horizontal 分组各页面复用。
 * 容器外包一层 relative 包裹，并渲染 ContainerScanLine 作为兄弟节点，
 * 让触发线按 tocData 的 overlay/offset/edges 自动调整（替代原先写死的 sticky 触发线）。
 * 页面说明、局部控件等差异由各页面自行组织。
 * @en Shared content area for horizontal demos.
 * Renders the horizontal scroll container and equal-width card sections, reused by each page in the horizontal group.
 * The container is wrapped in a relative layer with a sibling ContainerScanLine,
 * so the trigger lines auto-adjust with tocData's overlay/offset/edges (replacing the previously hardcoded sticky trigger line).
 * Page descriptions, local controls, and other differences are organized by each page itself.
 */
export function HorizontalSections({ sections, containerRef, indexLabel, children }: HorizontalSectionsProps) {
	return (
		<div className="relative">
			<div
				ref={containerRef}
				className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-x-auto rounded-md border border-border p-6"
			>
				{sections.map((section, idx) => (
					<section
						key={section.id}
						id={section.id}
						className="flex h-full w-[min(60vw,520px)] flex-none flex-col"
					>
						{indexLabel && (
							<div className="mb-2 text-xs text-muted">
								index: {idx} · id: {section.id}
							</div>
						)}
						<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
						<div className="min-h-0 flex-1 overflow-y-auto pr-1">
							<p className="leading-relaxed text-muted">{section.text}</p>
						</div>
					</section>
				))}

				{children}
			</div>

			{/* @zh 容器内激活阈值参考线：absolute 覆盖容器 border-box，按 tocData 自动调整 @en In-container activation threshold reference lines: absolute overlay over the container's border-box, auto-adjusting with tocData */}
			<ContainerScanLine />
		</div>
	)
}
