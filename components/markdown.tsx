import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components: Partial<Components> = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    // Table components with custom styles
    table: ({ node, children, ...props }) => (
      <table
        {...props}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ccc",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        {children}
      </table>
    ),
    thead: ({ node, children, ...props }) => (
      <thead
        {...props}
        style={{
          backgroundColor: "#f4f4f4",
          color: "#333",
          fontWeight: "bold",
        }}
      >
        {children}
      </thead>
    ),
    tbody: ({ node, children, ...props }) => (
      <tbody
        {...props}
        style={{
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        {children}
      </tbody>
    ),
    tr: ({ node, children, ...props }) => (
      <tr
        {...props}
        style={{
          borderBottom: "1px solid #ccc",
        }}
      >
        {children}
      </tr>
    ),
    th: ({ node, children, ...props }) => (
      <th
        {...props}
        style={{
          padding: "0.5rem 1rem",
          textAlign: "left",
          fontWeight: "bold",
          borderRight: "1px solid #ccc",
        }}
      >
        {children}
      </th>
    ),
    td: ({ node, children, ...props }) => (
      <td
        {...props}
        style={{
          padding: "0.5rem 1rem",
          borderRight: "1px solid #ccc",
        }}
      >
        {children}
      </td>
    ),

    // List components with custom styles
    ol: ({ node, children, ...props }) => (
      <ol
        {...props}
        style={{
          listStyleType: "decimal",
          marginLeft: "1rem",
          paddingLeft: "1rem",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li
        {...props}
        style={{
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
        }}
      >
        {children}
      </li>
    ),
    ul: ({ node, children, ...props }) => (
      <ul
        {...props}
        style={{
          listStyleType: "disc",
          marginLeft: "1rem",
          paddingLeft: "1rem",
        }}
      >
        {children}
      </ul>
    ),

    // Strong text (bold) with custom styles
    strong: ({ node, children, ...props }) => (
      <strong
        {...props}
        style={{
          fontWeight: "bold",
        }}
      >
        {children}
      </strong>
    ),

    // Link components with custom styles
    a: ({ node, children, ...props }) => (
      <Link
        {...props}
        style={{
          color: "#007BFF",
          textDecoration: "underline",
        }}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </Link>
    ),

    // Heading components with custom styles
    h1: ({ node, children, ...props }) => (
      <h1
        {...props}
        style={{
          fontSize: "2rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2
        {...props}
        style={{
          fontSize: "1.75rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3
        {...props}
        style={{
          fontSize: "1.5rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }) => (
      <h4
        {...props}
        style={{
          fontSize: "1.25rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h4>
    ),
    h5: ({ node, children, ...props }) => (
      <h5
        {...props}
        style={{
          fontSize: "1rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h5>
    ),
    h6: ({ node, children, ...props }) => (
      <h6
        {...props}
        style={{
          fontSize: "0.875rem",
          fontWeight: "semibold",
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h6>
    ),

    // Blockquote component with custom styles
    blockquote: ({ node, children, ...props }) => (
      <blockquote
        {...props}
        style={{
          borderLeft: "4px solid #ccc",
          paddingLeft: "1rem",
          fontStyle: "italic",
          color: "#555",
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      >
        {children}
      </blockquote>
    ),

    // Span component with custom styles
    span: ({ node, children, ...props }) => {
      // Check if styles are passed through props and merge with default styles
      const customStyles = props.style || {}; // Custom styles passed as props
      const mergedStyles = {
        ...customStyles, // Merge any custom styles passed in the props
      };

      return (
        <span {...props} style={mergedStyles}>
          {children}
        </span>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
