"use client";

import type { ReactNode } from "react";
import type { DemoConfig } from "./config";
import styles from "./horizontal-demo.module.css";

interface ConfigPanelProps {
	config: DemoConfig
	onChange: (patch: Partial<DemoConfig>) => void
	onReset: () => void
}

function Group({ title, children }: { title: string, children: ReactNode }) {
	return (
		<section className={styles.group}>
			<h3 className={styles.groupTitle}>{title}</h3>
			{children}
		</section>
	);
}

interface SliderProps {
	label: string
	value: number
	min: number
	max: number
	step?: number
	unit?: string
	signed?: boolean
	disabled?: boolean
	onChange: (value: number) => void
}

function Slider({ label, value, min, max, step = 1, unit = "px", signed = false, disabled = false, onChange }: SliderProps) {
	const displayed = `${signed && value > 0 ? "+" : ""}${value}${unit}`;
	return (
		<div className={styles.row}>
			<div className={styles.sliderHead}>
				<span>{label}</span>
				<code className={styles.valueBadge}>{displayed}</code>
			</div>
			<input
				type="range"
				className={styles.slider}
				min={min}
				max={max}
				step={step}
				value={value}
				disabled={disabled}
				onChange={e => onChange(Number(e.target.value))}
			/>
		</div>
	);
}

interface Option<T extends string> {
	value: T
	label: string
}

interface SegmentedProps<T extends string> {
	value: T
	options: Option<T>[]
	disabled?: boolean
	onChange: (value: T) => void
}

function Segmented<T extends string>({ value, options, disabled = false, onChange }: SegmentedProps<T>) {
	return (
		<div className={styles.segmented} data-disabled={disabled}>
			{options.map(option => (
				<button
					key={option.value}
					type="button"
					disabled={disabled}
					className={value === option.value ? styles.segOn : styles.seg}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

interface ToggleProps {
	label: string
	hint?: string
	checked: boolean
	disabled?: boolean
	onChange: (checked: boolean) => void
}

function Toggle({ label, hint, checked, disabled = false, onChange }: ToggleProps) {
	return (
		<div className={`${styles.row} ${styles.toggleRow}${disabled ? ` ${styles.disabled}` : ""}`}>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				disabled={disabled}
				className={checked ? styles.switchOn : styles.switch}
				onClick={() => onChange(!checked)}
			>
				<span className={styles.switchKnob} />
			</button>
			<div>
				<div className={styles.toggleLabel}>{label}</div>
				{hint ? <div className={styles.hint}>{hint}</div> : null}
			</div>
		</div>
	);
}

/**
 * @zh 实时配置面板：所有修改直接写回页面 state，useActiveScroll 会在每次渲染后
 * 通过引擎的 setOptions 热更新，无需重建实例。
 * @en Live config panel: every change is written back to page state; useActiveScroll
 * hot-applies it through the engine's setOptions after each render, without
 * recreating the instance.
 */
export function ConfigPanel({ config, onChange, onReset }: ConfigPanelProps) {
	return (
		<div className={styles.panelInner}>
			<div className={styles.panelHead}>
				<span>配置面板</span>
				<button type="button" className={styles.resetBtn} onClick={onReset}>
					重置
				</button>
			</div>

			<Group title="触发线 Trigger line">
				<Slider
					label="左侧遮挡 overlay"
					value={config.overlay}
					min={0}
					max={160}
					onChange={overlay => onChange({ overlay })}
				/>
				<Slider
					label="终点偏移 offset.toEnd（→）"
					value={config.offsetToEnd}
					min={-160}
					max={320}
					signed
					onChange={offsetToEnd => onChange({ offsetToEnd })}
				/>
				<Slider
					label="起点偏移 offset.toStart（←）"
					value={config.offsetToStart}
					min={-160}
					max={320}
					signed
					onChange={offsetToStart => onChange({ offsetToStart })}
				/>
				<Toggle
					label="调试覆盖层 debug"
					hint="可视化算法实际使用的触发线"
					checked={config.debug}
					onChange={debug => onChange({ debug })}
				/>
				<Toggle
					label="显示文字标签 debug.label"
					checked={config.debugLabel}
					disabled={!config.debug}
					onChange={debugLabel => onChange({ debugLabel })}
				/>
			</Group>

			<Group title="边缘策略 edges">
				<div className={styles.row}>
					<div className={styles.fieldLabel}>首个目标 edges.first</div>
					<Segmented
						value={config.firstMode}
						options={[
							{ value: "force", label: "强制激活 true" },
							{ value: "distance", label: "按距离 number" },
						]}
						onChange={firstMode => onChange({ firstMode })}
					/>
				</div>
				<Slider
					label="距触发线提前激活"
					value={config.firstDistance}
					min={0}
					max={400}
					disabled={config.firstMode !== "distance"}
					onChange={firstDistance => onChange({ firstDistance })}
				/>
				<div className={styles.row}>
					<div className={styles.fieldLabel}>末个目标 edges.last</div>
					<Segmented
						value={config.lastMode}
						options={[
							{ value: "force", label: "强制激活 true" },
							{ value: "distance", label: "按距离 number" },
						]}
						onChange={lastMode => onChange({ lastMode })}
					/>
				</div>
				<Slider
					label="越过触发线后解除"
					value={config.lastDistance}
					min={0}
					max={400}
					disabled={config.lastMode !== "distance"}
					onChange={lastDistance => onChange({ lastDistance })}
				/>
				<p className={styles.hint}>number 模式允许出现“无激活目标”，调试覆盖层中以橙色点线表示。</p>
			</Group>

			<Group title="同步与门控 Sync &amp; gate">
				<div className={styles.row}>
					<div className={styles.fieldLabel}>URL hash 同步</div>
					<Segmented
						value={config.hash}
						options={[
							{ value: "off", label: "off" },
							{ value: "replace", label: "replace" },
							{ value: "push", label: "push" },
						]}
						onChange={hash => onChange({ hash })}
					/>
					{config.firstMode === "force"
						? (
							<p className={styles.hint}>edges.first 为 true 时，首个目标按库约定跳过 hash 写入。</p>
						)
						: null}
				</div>
				<Toggle
					label="媒体查询门控 mediaQuery"
					hint="仅在查询匹配期间启用滚动监听"
					checked={config.mediaEnabled}
					onChange={mediaEnabled => onChange({ mediaEnabled })}
				/>
				{config.mediaEnabled
					? (
						<div className={styles.row}>
							<input
								type="text"
								className={styles.textInput}
								value={config.mediaQuery}
								spellCheck={false}
								onChange={e => onChange({ mediaQuery: e.target.value })}
							/>
							<div className={styles.presetRow}>
								{["(min-width: 900px)", "(max-width: 700px)"].map(preset => (
									<button
										key={preset}
										type="button"
										className={styles.presetBtn}
										onClick={() => onChange({ mediaQuery: preset })}
									>
										{preset}
									</button>
								))}
							</div>
						</div>
					)
					: null}
			</Group>

			<Group title="演示内容 Content">
				<Slider
					label="卡片数量"
					value={config.sectionCount}
					min={5}
					max={16}
					unit=" 个"
					onChange={sectionCount => onChange({ sectionCount })}
				/>
				<Toggle
					label="点击导航平滑滚动"
					hint="关闭后使用瞬时跳转（auto）"
					checked={config.smoothScroll}
					onChange={smoothScroll => onChange({ smoothScroll })}
				/>
			</Group>

			<button type="button" className={styles.resetFull} onClick={onReset}>
				恢复默认配置
			</button>
		</div>
	);
}
