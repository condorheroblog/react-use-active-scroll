import "./globals.css";

export const metadata = {
	title: "react-use-active-scroll + Next.js",
	description: "Next.js demo for react-use-active-scroll.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
