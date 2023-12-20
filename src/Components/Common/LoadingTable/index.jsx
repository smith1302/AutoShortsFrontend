import { useEffect, useState, useContext } from "react";

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';

function LoadingTable({ children, loading = false, error = null, ...props }) {
    if (loading) {
        return (
            <Table {...props}>
                <BasicTableContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '150px 10px' }}>
                        <CircularProgress />
                    </Box>
                </BasicTableContent>
            </Table>
        )
    } else if (error) {
        return (
            <Table {...props}>
                <BasicTableContent>
                    <Alert severity="error">{error}</Alert>
                </BasicTableContent>
            </Table>
        )
    }

    return (
        <Table {...props}>
            {children}
        </Table>
    );
}

function BasicTableContent({children}) {
    return (
        <TableHead>
            <TableRow>
                <TableCell>
                    {children}
                </TableCell>
            </TableRow>
        </TableHead>
    )
}

export default LoadingTable;